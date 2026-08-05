#!/bin/sh

set -eu

readonly FIRST_SUPPORTED_TAG='15.1.0'

dry_run=false
no_upload=false
range_start="$FIRST_SUPPORTED_TAG"
range_end=''

usage() {
  cat <<'EOF'
Usage: build-history.sh [--dry-run] [--no-upload] [--from X.Y.Z] [--to X.Y.Z] [--range X.Y.Z..X.Y.Z]

Rebuilds release tags in Git tag chronological order. By default, uploads each
completed Storybook build to the configured documentation archive. --no-upload
writes the last selected build to dist/storybook/ui in the main checkout.
EOF
}

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

node_image_for_angular_major() {
  case "$1" in
    15|16) printf '%s\n' 'node:18.20.4' ;;
    17|18) printf '%s\n' 'node:20.18.0' ;;
    19|20) printf '%s\n' 'node:22.14.0' ;;
    *) fail "unsupported Angular major $1" ;;
  esac
}

is_release_tag() {
  printf '%s\n' "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$'
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) dry_run=true ;;
    --no-upload) no_upload=true ;;
    --from)
      [ "$#" -ge 2 ] || fail '--from requires a release tag'
      range_start="$2"
      shift
      ;;
    --to)
      [ "$#" -ge 2 ] || fail '--to requires a release tag'
      range_end="$2"
      shift
      ;;
    --range)
      [ "$#" -ge 2 ] || fail '--range requires X.Y.Z..X.Y.Z'
      range_start=${2%%..*}
      range_end=${2#*..}
      [ "$range_start" != "$2" ] && [ -n "$range_start" ] && [ -n "$range_end" ] || fail '--range requires X.Y.Z..X.Y.Z'
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *) fail "unknown option: $1" ;;
  esac
  shift
done

is_release_tag "$range_start" || fail "invalid start tag: $range_start"
if [ -n "$range_end" ]; then
  is_release_tag "$range_end" || fail "invalid end tag: $range_end"
fi

repo_root=$(git rev-parse --show-toplevel) || fail 'must run inside a Git repository'
git -C "$repo_root" fetch --force --tags origin
git -C "$repo_root" rev-parse --verify --quiet "refs/tags/$FIRST_SUPPORTED_TAG" >/dev/null || fail "$FIRST_SUPPORTED_TAG is not reachable"

selected_tags=''
supported=false
collect=false
for tag in $(git -C "$repo_root" for-each-ref --sort=creatordate --format='%(refname:short)' refs/tags); do
  is_release_tag "$tag" || continue

  if [ "$tag" = "$FIRST_SUPPORTED_TAG" ]; then
    supported=true
  fi
  [ "$supported" = true ] || continue
  if [ "$tag" = "$range_start" ]; then
    collect=true
  fi
  [ "$collect" = true ] || continue

  selected_tags="${selected_tags}${tag}\n"
  [ "$tag" = "$range_end" ] && break
done

[ -n "$selected_tags" ] || fail "start tag $range_start was not found in Git tag chronology"
if [ -n "$range_end" ]; then
  case "$selected_tags" in
    *"$range_end"*) ;;
    *) fail "end tag $range_end was not found after $range_start" ;;
  esac
fi

printf 'Selected Storybook tags in Git chronology:\n'
printf '%b' "$selected_tags"

for tag in $(printf '%b' "$selected_tags"); do
  git -C "$repo_root" cat-file -e "$tag:package.json" || fail "$tag has no package.json"
  git -C "$repo_root" cat-file -e "$tag:.storybook" || fail "$tag has no .storybook configuration"
  git -C "$repo_root" show "$tag:package.json" | grep -Eq '"build-storybook"[[:space:]]*:' || fail "$tag has no build-storybook script"
  angular_major=$(git -C "$repo_root" show "$tag:package.json" | sed -n '/"@angular\/core"/{s/.*"@angular\/core"[[:space:]]*:[[:space:]]*"[~^]*\([0-9][0-9]*\)\..*/\1/p;q;}')
  [ -n "$angular_major" ] || fail "$tag has no readable @angular/core version"
  node_image=$(node_image_for_angular_major "$angular_major")
  printf '%s: Angular %s -> %s\n' "$tag" "$angular_major" "$node_image"
done

[ "$dry_run" = true ] && exit 0

command -v docker >/dev/null 2>&1 || fail 'docker is required for isolated builds'
if [ "$no_upload" = false ]; then
  : "${APPNAME:?APPNAME is required for upload}"
  : "${STAGING_USER:?STAGING_USER is required for upload}"
  : "${STAGING_HOST:?STAGING_HOST is required for upload}"
fi

work_root=$(mktemp -d "${TMPDIR:-/tmp}/storybook-history.XXXXXX")
cleanup() {
  rm -rf "$work_root"
  git -C "$repo_root" worktree prune
}
trap cleanup EXIT HUP INT TERM

if [ "$no_upload" = true ]; then
  output_dir="$repo_root/dist/storybook/ui"
  rm -rf "$output_dir"
  mkdir -p "$output_dir"
fi

for tag in $(printf '%b' "$selected_tags"); do
  worktree="$work_root/$tag"
  build_output="$work_root/$tag-output"
  git -C "$repo_root" worktree add --detach "$worktree" "$tag" || fail "failed to create isolated worktree for $tag"

  angular_major=$(sed -n '/"@angular\/core"/{s/.*"@angular\/core"[[:space:]]*:[[:space:]]*"[~^]*\([0-9][0-9]*\)\..*/\1/p;q;}' "$worktree/package.json")
  node_image=$(node_image_for_angular_major "$angular_major")
  printf 'Building %s with %s\n' "$tag" "$node_image"
  if ! docker run --rm --user "$(id -u):$(id -g)" -v "$worktree:/workspace" -w /workspace "$node_image" sh -ceu 'npm ci --cache /tmp/npm-cache --prefer-offline --no-audit --no-fund && npm run build-storybook'; then
    fail "build failed for $tag"
  fi
  [ -f "$worktree/dist/storybook/ui/index.html" ] || fail "$tag did not produce dist/storybook/ui/index.html"
  mkdir -p "$build_output"
  cp -R "$worktree/dist/storybook/ui/." "$build_output/"
  git -C "$repo_root" worktree remove --force "$worktree"

  if [ "$no_upload" = true ]; then
    rm -rf "$output_dir"
    mkdir -p "$output_dir"
    cp -R "$build_output/." "$output_dir/"
    printf 'Built %s: %s\n' "$tag" "$output_dir"
    continue
  fi

  ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
set -eu
remote_root="$HOME/Apps/$1/docs/v"
remote_temp="$remote_root/.$2.tmp-$3"
mkdir -p "$remote_root"
rm -rf "$remote_temp"
mkdir "$remote_temp"
EOF
  if ! scp -r "$build_output/." "$STAGING_USER@$STAGING_HOST:Apps/$APPNAME/docs/v/.${tag}.tmp-$$/"; then
    ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
rm -rf "$HOME/Apps/$1/docs/v/.$2.tmp-$3"
EOF
    fail "upload failed for $tag"
  fi
  ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
set -eu
remote_root="$HOME/Apps/$1/docs/v"
final_dir="$remote_root/$2"
temp_dir="$remote_root/.$2.tmp-$3"
backup_dir="$remote_root/.$2.previous-$3"
rm -rf "$backup_dir"
had_final=0
if [ -e "$final_dir" ]; then
  mv "$final_dir" "$backup_dir"
  had_final=1
fi
if mv "$temp_dir" "$final_dir"; then
  if [ "$had_final" -eq 1 ]; then
    rm -rf "$backup_dir"
  fi
else
  if [ "$had_final" -eq 1 ]; then
    mv "$backup_dir" "$final_dir"
  fi
  exit 1
fi
EOF
  printf 'Uploaded %s: ~/Apps/%s/docs/v/%s\n' "$tag" "$APPNAME" "$tag"
done

if [ "$no_upload" = true ]; then
  printf 'No-upload mode complete: %s\n' "$output_dir"
else
  printf 'History upload batch complete. Recreate docs service once in CI.\n'
fi
