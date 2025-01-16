FROM node:20

WORKDIR /back-end


EXPOSE 5000

COPY . .

RUN npm install
RUN npm install sqlite3

CMD [ "node","server" ] 