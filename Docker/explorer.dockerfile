FROM poet-base

COPY ["./node/config/explorer.json", "/etc/poet/explorer.json"]

VOLUME /poet/src

EXPOSE 3000

CMD [ "npm", "run", "explorer-api", "--", "-c", "/etc/poet/explorer.json" ]
