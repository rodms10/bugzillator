#!/bin/bash
# Build Script to create XPI files

# Cleanup, then make build directory
rm -f bugzillator.xpi
rm -rf build

echo "Copy files..."

# create temp dir
mkdir tmp

# Copy all scripts, images and stylesheets
cp bootstrap.js harness-options.json install.rdf locales.json tmp/
cp -R defaults tmp/
cp -R locale tmp/
cp -R resources tmp/

# Copy all locales, inspired from build.sh in Greasemonkey
# for entry in locale/*; do
#   if [ -d $entry ]; then
#     entry=`basename $entry`
#     from_paths="locale/$entry/*.dtd locale/$entry/*.properties"
#     to_path="build/locale/$entry"
#     mkdir $to_path
#     cp $from_paths $to_path
#   fi
# done

echo "Generate XPI file..."
cd tmp
zip -r1DX ../bugzillator.xpi *
echo "Cleanup..."
cd ..
rm -rf tmp
echo "Done!"
