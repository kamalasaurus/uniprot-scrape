deno compile -A ./index.js

docker build --platform linux/amd64 -t uniprot-scrape .

//docker run uniprot-scrape

docker run index

docker run -v your-volume-name:/app your-image-name

singularity run --bind /path/on/host:/app your-image-name.sif
