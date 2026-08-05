#!/bin/sh

set -eu

readonly FIRST_SUPPORTED_TAG='18.0.1'
readonly DEFAULT_BATCH_DIR='dist/storybook/history-batch'
readonly MANIFEST_NAME='manifest.txt'

dry_run=false
mode='combined'
range_start="$FIRST_SUPPORTED_TAG"
range_end=''
batch_dir=''

usage() {
  cat <<'EOF'
Usage: build-history.sh [--dry-run] [--build-only|--upload-only] [--output-dir DIR]
                        [--input-dir DIR] [--from X.Y.Z] [--to X.Y.Z]
                        [--range X.Y.Z..X.Y.Z]

Rebuilds release tags in Git tag chronological order, starting at 18.0.1.

Modes:
  --build-only       Build selected tags in isolated Docker containers. Writes a complete
                     batch artifact to --output-dir (default: dist/storybook/history-batch).
  --upload-only      Upload only batch declared by --input-dir/manifest.txt (default:
                     dist/storybook/history-batch). Does not invoke Docker or rebuild tags.
  (default)          Build and upload selected tags in one invocation.

A batch artifact contains manifest.txt (one release tag per line, in chronological
order) and one directory per declared tag, each containing index.html. Build-only
publishes its output directory only after every selected build is complete.

Deterministic 18.0.1 artifact regression (requires Docker):
  rm -rf /tmp/storybook-history-18.0.1 && \
  sh docker/docs/assets/build-history.sh --build-only --from 18.0.1 --to 18.0.1 \
    --output-dir /tmp/storybook-history-18.0.1 && \
  test -f /tmp/storybook-history-18.0.1/18.0.1/index.html && \
  test "$(cat /tmp/storybook-history-18.0.1/manifest.txt)" = 18.0.1

--dry-run prints tag selection and Node image mapping without Docker, SSH, or remote
environment variables. --no-upload remains a deprecated alias for --build-only.
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

set_mode() {
  [ "$mode" = combined ] || fail '--build-only and --upload-only are mutually exclusive'
  mode="$1"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run) dry_run=true ;;
    --build-only|--no-upload) set_mode 'build-only' ;;
    --upload-only) set_mode 'upload-only' ;;
    --output-dir)
      [ "$#" -ge 2 ] || fail '--output-dir requires a directory'
      batch_dir="$2"
      shift
      ;;
    --input-dir)
      [ "$#" -ge 2 ] || fail '--input-dir requires a directory'
      batch_dir="$2"
      shift
      ;;
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

[ -n "$batch_dir" ] || batch_dir="$DEFAULT_BATCH_DIR"

validate_batch() {
  manifest="$batch_dir/$MANIFEST_NAME"
  [ -f "$manifest" ] || fail "batch manifest is missing: $manifest"
  [ -s "$manifest" ] || fail "batch manifest is empty: $manifest"
  seen_manifest=$(mktemp "${TMPDIR:-/tmp}/storybook-history-manifest.XXXXXX")
  while IFS= read -r tag || [ -n "$tag" ]; do
    is_release_tag "$tag" || fail "invalid tag in batch manifest: $tag"
    grep -Fqx "$tag" "$seen_manifest" && fail "duplicate tag in batch manifest: $tag"
    [ -d "$batch_dir/$tag" ] || fail "batch directory is missing for $tag"
    [ -f "$batch_dir/$tag/index.html" ] || fail "batch output is missing index.html for $tag"
    printf '%s\n' "$tag" >> "$seen_manifest"
  done < "$manifest"
  rm -f "$seen_manifest"
}

upload_tag() {
  tag="$1"
  ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
set -eu
remote_root="$HOME/Apps/$1/docs/v"
remote_temp="$remote_root/.$2.tmp-$3"
mkdir -p "$remote_root"
rm -rf "$remote_temp"
mkdir "$remote_temp"
EOF
  if ! scp -r "$batch_dir/$tag/." "$STAGING_USER@$STAGING_HOST:Apps/$APPNAME/docs/v/.${tag}.tmp-$$/"; then
    ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
rm -rf "$HOME/Apps/$1/docs/v/.$2.tmp-$3"
EOF
    fail "upload failed for $tag"
  fi
  if ! ssh "$STAGING_USER@$STAGING_HOST" sh -s -- "$APPNAME" "$tag" "$$" <<'EOF'
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
  then
    fail "upload failed for $tag"
  fi
  printf 'Uploaded %s: ~/Apps/%s/docs/v/%s\n' "$tag" "$APPNAME" "$tag"
}

if [ "$mode" = 'upload-only' ]; then
  validate_batch
  [ "$dry_run" = true ] && exit 0
  : "${APPNAME:?APPNAME is required for upload}"
  : "${STAGING_USER:?STAGING_USER is required for upload}"
  : "${STAGING_HOST:?STAGING_HOST is required for upload}"
  while IFS= read -r tag || [ -n "$tag" ]; do
    upload_tag "$tag"
  done < "$batch_dir/$MANIFEST_NAME"
  printf 'History upload batch complete. Recreate docs service once in CI.\n'
  exit 0
fi

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
  if [ "$tag" = "$FIRST_SUPPORTED_TAG" ]; then supported=true; fi
  [ "$supported" = true ] || continue
  if [ "$tag" = "$range_start" ]; then collect=true; fi
  [ "$collect" = true ] || continue
  selected_tags="${selected_tags}${tag}\n"
  [ "$tag" = "$range_end" ] && break
done

[ -n "$selected_tags" ] || fail "start tag $range_start was not found in Git tag chronology"
if [ -n "$range_end" ]; then
  case "$selected_tags" in *"$range_end"*) ;; *) fail "end tag $range_end was not found after $range_start" ;; esac
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
if [ "$mode" = 'combined' ]; then
  : "${APPNAME:?APPNAME is required for upload}"
  : "${STAGING_USER:?STAGING_USER is required for upload}"
  : "${STAGING_HOST:?STAGING_HOST is required for upload}"
fi

work_root=$(mktemp -d "${TMPDIR:-/tmp}/storybook-history.XXXXXX")
artifact_staging="${batch_dir}.tmp-$$"
cleanup() {
  rm -rf "$work_root" "$artifact_staging"
  git -C "$repo_root" worktree prune
}
trap cleanup EXIT HUP INT TERM
rm -rf "$artifact_staging"
mkdir -p "$artifact_staging"

for tag in $(printf '%b' "$selected_tags"); do
  worktree="$work_root/$tag"
  git -C "$repo_root" worktree add --detach "$worktree" "$tag" || fail "failed to create isolated worktree for $tag"
  angular_major=$(sed -n '/"@angular\/core"/{s/.*"@angular\/core"[[:space:]]*:[[:space:]]*"[~^]*\([0-9][0-9]*\)\..*/\1/p;q;}' "$worktree/package.json")
  node_image=$(node_image_for_angular_major "$angular_major")
  printf 'Building %s with %s\n' "$tag" "$node_image"
  if ! docker run --rm --user "$(id -u):$(id -g)" -v "$worktree:/workspace" -w /workspace "$node_image" sh -ceu 'npm ci --cache /tmp/npm-cache --prefer-offline --no-audit --no-fund && npm run build-storybook'; then
    fail "build failed for $tag"
  fi
  [ -f "$worktree/dist/storybook/ui/index.html" ] || fail "$tag did not produce dist/storybook/ui/index.html"
  mkdir -p "$artifact_staging/$tag"
  cp -R "$worktree/dist/storybook/ui/." "$artifact_staging/$tag/"
  [ -f "$artifact_staging/$tag/index.html" ] || fail "$tag artifact is missing index.html"
  printf '%s\n' "$tag" >> "$artifact_staging/$MANIFEST_NAME"
  git -C "$repo_root" worktree remove --force "$worktree"
done

if [ "$mode" = 'build-only' ]; then
  rm -rf "$batch_dir"
  mv "$artifact_staging" "$batch_dir"
  artifact_staging=''
  printf 'Build-only batch complete: %s\n' "$batch_dir"
  exit 0
fi

batch_dir="$artifact_staging"
validate_batch
while IFS= read -r tag || [ -n "$tag" ]; do
  upload_tag "$tag"
done < "$batch_dir/$MANIFEST_NAME"
printf 'History upload batch complete. Recreate docs service once in CI.\n'
