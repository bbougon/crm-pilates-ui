FROM node:14-alpine AS development
ENV NODE_ENV development

WORKDIR /app

COPY ../package.json .
COPY ../yarn.lock .
RUN yarn install

COPY .. .

EXPOSE 3000

CMD [ "yarn", "start" ]

FROM node:14-alpine AS builder
ENV NODE_ENV production

WORKDIR /app

COPY ../package.json .
COPY ../yarn.lock .
RUN yarn install --production
COPY .. .
RUN yarn build

# Bundle static assets with nginx
FROM nginx:1.21.0-alpine AS production
ENV NODE_ENV production
# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html
# Add your nginx.conf
COPY ../nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]