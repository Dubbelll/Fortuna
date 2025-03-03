# Fortuna

Solver for Zachtronics' Fortune's Foundation solitaire variant

### Docker

`docker build -t fortuna:latest .`  
`docker run -p 3000:80 --rm --name fortuna fortuna`  
`docker buildx build --platform linux/arm64 -t registry.dubbelll.dev/fortuna:latest --push .`

## References

https://briangrinstead.com/blog/astar-search-algorithm-in-javascript  
https://github.com/sumeet/solsolver  
https://github.com/dantull/fortunes-foundation-solver
https://eloquentjavascript.net/1st_edition/appendix2.html
