deno compile -A ./index.js

docker build --platform linux/amd64 -t uniprot-scrape .

docker run uniprot-scrape