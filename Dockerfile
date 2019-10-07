FROM node:8.9-alpine
COPY . .
RUN npm install
# RUN npm run build --production
# RUN npm install -g serve
CMD ["npm", "start"]
# EXPOSE 3000