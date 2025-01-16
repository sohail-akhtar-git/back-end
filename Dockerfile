FROM node:16

WORKDIR /back-end


EXPOSE 5000

COPY . .

RUN npm install

CMD [ "node" "server" ]