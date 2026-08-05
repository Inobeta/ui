#!/bin/sh

set -eu

versions_dir=${DOCS_VERSIONS_DIR:-/srv/docs/versions}
output=/usr/share/nginx/html/index.html
tmp_file=$(mktemp /usr/share/nginx/html/.index.html.XXXXXX)

cleanup() {
    rm -f "$tmp_file"
}
trap cleanup EXIT HUP INT TERM

printf '%s\n' '<!doctype html>' '<html lang="en">' '<head>' \
    '<meta charset="utf-8">' \
    '<meta name="viewport" content="width=device-width, initial-scale=1">' \
    '<title>Storybook documentation</title>' \
    '<link rel="stylesheet" href="/assets/index.css">' \
    '</head>' '<body>' '<main>' \
    '<h1>Storybook documentation</h1>' \
    '<p class="intro">Select a documentation version.</p>' >"$tmp_file"

current_present=0
if [ -d "$versions_dir/current" ]; then
    current_present=1
fi

printf '%s\n' '<ul class="versions">' >>"$tmp_file"
if [ "$current_present" -eq 1 ]; then
    printf '%s\n' '  <li><a href="/v/current/">current</a></li>' >>"$tmp_file"
fi

if [ -d "$versions_dir" ]; then
    for version_path in "$versions_dir"/*; do
        [ -d "$version_path" ] || continue
        version=${version_path##*/}
        if [ "$version" != current ] && printf '%s\n' "$version" | grep -Eq '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'; then
            printf '%s\n' "$version"
        fi
    done | awk -F. '{ printf "%020d.%020d.%020d %s\n", $1, $2, $3, $0 }' | sort -r | cut -d' ' -f2- | while IFS= read -r version; do
        printf '  <li><a href="/v/%s/">%s</a></li>\n' "$version" "$version"
    done >>"$tmp_file"
fi

if [ "$current_present" -eq 0 ] && ! grep -Eq 'href="/v/[0-9]' "$tmp_file"; then
    printf '%s\n' '<li class="empty">No documentation versions are available.</li>' >>"$tmp_file"
fi

printf '%s\n' '</ul>' '</main>' '</body>' '</html>' >>"$tmp_file"
chmod 0644 "$tmp_file"
mv "$tmp_file" "$output"
trap - EXIT HUP INT TERM
