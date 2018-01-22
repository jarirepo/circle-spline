import Vector from './vector'

const { acos, cos, PI, pow, sign, sin } = Math
const R2D = 180 / PI
const arcResol = 5
const minSegm = 3
const maxSegm = 99

export default class Arc {  
  constructor(p0, p1, p2, t0, t1, t2, tau0, tau1, radius, phi, axis) {
    this.p0 = p0
    this.p1 = p1
    this.p2 = p2
    this.t0 = t0
    this.t1 = t1
    this.t2 = t2
    this.tau0 = tau0
    this.tau1 = tau1
    this.radius = radius
    this.phi = phi
    this.axis = axis
    this.pts = new Array()
    this._generate()
  }

  _generate() {
    // generates the two arcs in a single sweep
    const sgn = sign(this.axis.z)
    const arcLen = 2 * (this.tau0 + this.tau1) * this.radius
    let n = arcLen / arcResol + 0.5 | 0
    if (n < minSegm) {n = minSegm} else if (n > maxSegm) {n = maxSegm}

    let v = this.p2.clone().sub(this.p0).normalize()
    let b = this.p2.dist(this.p0)
    let tau = this.tau0 + this.tau1
    
    let u, fu, phi, px, py, c, s
    
    this.pts.push(this.p0.clone())

    for (let i = 1; i <= n; i++) {
      u = i / n
      phi = (1 - u) * tau * sgn
      fu = b * sin(u * tau) / sin(tau)
      c = cos(phi)
      s = sin(phi)
      px = fu * (c * v.x + s * v.y) + this.p0.x
      py = fu * (c * v.y - s * v.x) + this.p0.y
      this.pts.push(new Vector(px, py))
    }
  }

  render(ctx) {
    // circular arc
    if (this.pts.length < 2) { return }
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(200,50,50,0.8)'
    ctx.lineWidth = 2
    ctx.moveTo(this.pts[0].x, this.pts[0].y)
    for (let i = 1; i < this.pts.length; i++) {
      ctx.lineTo(this.pts[i].x, this.pts[i].y)
    }
    ctx.stroke()
  }
}
