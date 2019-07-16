import Vector from './vector'

const { PI, pow } = Math
const TWO_PI = 2 * PI
const radius = 5

export default class ControlPoint {
  constructor(x = 0, y = 0, z = 0) {
    this.v = new Vector(x, y, z)
    this.t = null // tangent
    this._prev = null
    this._next = null
    this.selected = false
  }

  isPointInside(p) {
    return pow(this.v.x - p.x, 2) + pow(this.v.y - p.y, 2) < radius * radius
  }

  moveTo(x, y, z) {
    this.v.set(x, y, z)
  }

  render(ctx) {
    ctx.beginPath()
    ctx.fillStyle = '#0000ff'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.arc(this.v.x, this.v.y, radius, 0, TWO_PI)
    ctx.fill()
    if (this.selected) {
      ctx.stroke()
    }
  }
}
