#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source_icon="$project_dir/public/app-icon.svg"
resource_dir="$project_dir/android/app/src/main/res"

generate_icon() {
  local density="$1"
  local icon_size="$2"
  local foreground_size="$3"
  local target="$resource_dir/mipmap-$density"

  ffmpeg -loglevel error -i "$source_icon" -vf "scale=${icon_size}:${icon_size}" -frames:v 1 -y "$target/ic_launcher.png"
  ffmpeg -loglevel error -i "$source_icon" -vf "scale=${icon_size}:${icon_size}" -frames:v 1 -y "$target/ic_launcher_round.png"
  ffmpeg -loglevel error -i "$source_icon" \
    -vf "scale=$((foreground_size * 72 / 100)):$((foreground_size * 72 / 100)),pad=${foreground_size}:${foreground_size}:(ow-iw)/2:(oh-ih)/2:color=0x00000000" \
    -frames:v 1 -y "$target/ic_launcher_foreground.png"
}

generate_splash() {
  local target="$1"
  local width="$2"
  local height="$3"
  local icon_size=$(( (width < height ? width : height) * 34 / 100 ))

  ffmpeg -loglevel error -f lavfi -i "color=c=#e7f2e5:s=${width}x${height}" -i "$source_icon" \
    -filter_complex "[1:v]scale=${icon_size}:${icon_size}[icon];[0:v][icon]overlay=(W-w)/2:(H-h)/2" \
    -frames:v 1 -y "$resource_dir/$target/splash.png"
}

generate_icon mdpi 48 108
generate_icon hdpi 72 162
generate_icon xhdpi 96 216
generate_icon xxhdpi 144 324
generate_icon xxxhdpi 192 432

generate_splash drawable 480 320
generate_splash drawable-land-mdpi 480 320
generate_splash drawable-land-hdpi 800 480
generate_splash drawable-land-xhdpi 1280 720
generate_splash drawable-land-xxhdpi 1600 960
generate_splash drawable-land-xxxhdpi 1920 1280
generate_splash drawable-port-mdpi 320 480
generate_splash drawable-port-hdpi 480 800
generate_splash drawable-port-xhdpi 720 1280
generate_splash drawable-port-xxhdpi 960 1600
generate_splash drawable-port-xxxhdpi 1280 1920

echo "Android launcher and splash assets generated."
