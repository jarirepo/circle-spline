const {PI, pow, sin} = Math

export default function weightfcn(type, n) {
  return new Array(n).fill(0)
    .map((_, i) => {
      const u = i / (n - 1)
      
      switch (type) {
        case 'linear':
          return u
          break
        case 'parabolic':
          return (u < 0.5)? 2 * pow(u, 2) : 1 - 2 * pow(u - 1, 2)
        case 'cubic':
          return (3 - 2 * u) * pow(u, 2)
          break
        case 'trigonometric':
          return pow(sin(u * PI / 2), 2)
          break
        default:
          throw new Error('Invalid weight function')
      }
    })
}
