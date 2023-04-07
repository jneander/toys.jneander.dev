module.exports.routes = [
  {
    key: 'root',
    path: '/',
    component: 'src/pages/show-root/index.tsx'
  },

  {
    key: 'genetic-algorithms',
    path: '/genetic-algorithms',
    component: 'src/pages/genetic-algorithms/show-genetic-algorithms/index.tsx'
  },

  {
    key: 'card-splitting',
    path: '/genetic-algorithms/card-splitting',
    component: 'src/pages/genetic-algorithms/show-card-splitting/index.tsx'
  },

  {
    key: 'knight-covering',
    path: '/genetic-algorithms/knight-covering',
    component: 'src/pages/genetic-algorithms/show-knight-covering/index.tsx'
  },

  {
    key: 'one-max',
    path: '/genetic-algorithms/one-max',
    component: 'src/pages/genetic-algorithms/show-one-max/index.tsx'
  },

  {
    key: 'queens',
    path: '/genetic-algorithms/queens',
    component: 'src/pages/genetic-algorithms/show-queens/index.tsx'
  },

  {
    key: 'sorting-numbers',
    path: '/genetic-algorithms/sorting-numbers',
    component: 'src/pages/genetic-algorithms/show-sorting-numbers/index.tsx'
  },

  {
    key: 'text-matching',
    path: '/genetic-algorithms/text-matching',
    component: 'src/pages/genetic-algorithms/show-text-matching/index.tsx'
  },

  {
    key: 'simulations-index',
    path: '/simulations',
    component: 'src/pages/simulations/show-simulations/index.tsx'
  },

  {
    key: 'carykh-index',
    path: '/simulations/carykh',
    component: 'src/pages/simulations/carykh/show-carykh/index.tsx'
  },

  {
    key: 'carykh-evolution-simulator',
    path: '/simulations/carykh/evolution-simulator',
    component: 'src/pages/simulations/carykh/show-evolution-simulator/index.tsx'
  },

  {
    key: '404',
    path: '/404.html',
    component: 'src/pages/show-404/index.tsx'
  }
]
