import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('gardens', './routes/gardens.tsx'),
  route('my-garden', './routes/my-garden.tsx'),
] satisfies RouteConfig;
