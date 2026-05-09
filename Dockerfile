FROM node:18-bookworm-slim 

WORKDIR /var/www/html

COPY package*.json ./


RUN npm install


COPY . .

RUN npm run build

ENV PORT=5173
ENV HOST=0.0.0.0

EXPOSE 5173

CMD ["npm", "run", "start"]
