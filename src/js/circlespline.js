import Vector from './vector'
import Arc from './arc'
import weightfcn from './weightfcn'

const { abs, acos, cos, PI, pow, sign, sin } = Math
const R2D = 180 / PI
const  vectorLen = 100

export default class CircleSpline {
  constructor(poly, options = {}) {
    this.options = options
    this._poly = poly
    this._options = options
    this.arcs = new Array()
    this.pts = new Array()
    this._poly.on('modified', q => this.update())
  }

  update() {
    this._reset()
    this._getTangents()
    this._blendArcs()
  }

  render(ctx) {
    if (this.options.showPolygon) {
      this._poly.render(ctx)
    }
    if (this.options.showArcs) {
      this.arcs.forEach(arc => arc.render(ctx))
    }

    let q = this._poly._start

    for (let i = 0; i < this._poly.count; i++) {
      if (this.options.showTangents && q.t) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(50,200,50,0.8)'
        ctx.lineWidth = 2    
        ctx.moveTo(q.v.x - vectorLen / 2 * q.t.x, q.v.y - vectorLen / 2 * q.t.y)
        ctx.lineTo(q.v.x + vectorLen / 2 * q.t.x, q.v.y + vectorLen / 2 * q.t.y)
        ctx.stroke()            
      }
      q.render(ctx)
      q = q._next
    }

    if (this.pts.length < 2) { return }

    // blending curves
    ctx.beginPath()
    ctx.strokeStyle = 'rgba(0,50,200,0.8)'
    ctx.lineWidth = 2
    ctx.moveTo(this.pts[0].x, this.pts[0].y)
    for (let i = 1; i < this.pts.length; i++) {
      ctx.lineTo(this.pts[i].x, this.pts[i].y)
    }
    ctx.stroke()
  }

  _reset() {
    while (this.arcs.length > 0) {
      this.arcs.shift()
    }
    while (this.pts.length > 0) {
      this.pts.shift()
    }
  }
  
  _getTangents() {    
    if (this._poly.count < 3) { return }

    // process 3 consecutive points
    let q0 = this._poly._start
    let q1 = q0._next
    let q2 = q1._next

    for (let i = 0; i < this._poly.count; i++) {
      if (!(q1 && q2)) { continue }

      const a = q1.v.clone().sub(q0.v)
      const b = q2.v.clone().sub(q1.v)
      const c = q2.v.clone().sub(q0.v)

      const axis = a.cross(b)
      const len = a.mag()

      a.normalize()
      b.normalize()
      c.normalize()

      const [theta0, theta2] = [a.dot(c), b.dot(c)]
        .map(x => (x < -1)? -1 : (x > 1)? 1 : x)
        .map(x => acos(x))
        
      const theta1 = PI - theta0 - theta2

      // tangent angles
      const tau0 = theta2
      const tau1 = theta0
      
      // tangent vectors
      const t1 = b.clone().rotateZ(sign(-axis.z) * tau1)
      const t0 = t1.clone().mirror(a)
      const t2 = t1.clone().mirror(b)

      const phi = 2 * (PI - theta1)   // included angle
      const radius = len / (2 * sin(tau0))
      const arc = new Arc(q0.v, q1.v, q2.v, t0, t1, t2, tau0, tau1, radius, phi, axis)
      this.arcs.push(arc)

      // set tangents
      if (q0 === this._poly._start) {
        q0.t = t0
        q1.t = t1
        // q2.t = t2
      } else {
        q1.t = t1
        if (!this._poly.closed || (this._poly.closed && i < this._poly.count - 1)) {
          q2.t = t2
        }
      }

      q0 = q1
      q1 = q2
      q2 = q2._next
    }
  }

  _blendArcs() {
    // if (this.arcs.length < 2) { return }
    if (this.arcs.length === 0) { return }

    // precalculate the selected weighting function for the blending operations
    // (n should be provided via options)
    const n = 99
    const weights = weightfcn(this.options.blendingMethod, n)

    let arc1 = this.arcs[0]
    let arc2 = arc1

    // generate the starting arc
    if (!this._poly.closed) {      
      this._generateArc(arc1.p0, arc1.p1, arc1.radius, arc1.tau0, sign(arc1.axis.z))
    }

    let tau0, tau1,
        t0, t1,
        p0, p1

    let q0 = this._poly._start,
        q1 = q0._next

    // generate the blending curves
    loop: for (let i = 0; i < this.arcs.length; i++) {
      
      if (!this._poly.closed) {
        if (i === this.arcs.length - 1) { continue loop }
        arc1 = this.arcs[i]
        arc2 = this.arcs[i + 1]
        tau0 = arc1.tau1
        tau1 = arc2.tau0
        t0 = arc1.t1
        t1 = arc2.t0
        /*p0 = q0.v
        p1 = q1.v
        t0 = q0.t
        t1 = q1.t*/
        //t0 = q0.t
        //t1 = q1.t
      } else {
        if (i > 0) {
          arc1 = this.arcs[i - 1]
        } else {
          arc1 = this.arcs[this.arcs.length - 1]
        }
        arc2 = this.arcs[i]
        tau0 = arc1.tau1
        tau1 = arc2.tau1
        t0 = q0.t
        t1 = q1.t
        // p0 = q0.v
        // p1 = q1.v
      }
      p0 = arc1.p1
      p1 = arc2.p1

      const v = p1.clone().sub(p0)
      const b = v.mag()
      v.normalize()

      // Fix!
      if (this._poly.closed) {
        t1 = t1.clone().mirror(v)
      }

      const axis = t0.cross(t1)
      const sgn = sign(axis.z)
      let cosa = t0.dot(t1)
      cosa = (cosa < -1)? -1 : (cosa > 1)? 1 : cosa
      const ang = acos(cosa)
      
      weights.map((w, j) => t0.clone().rotateZ(sgn * w * ang))
      .map(t => {
        const w = v.cross(t).normalize()
        let cosa = t.dot(v)
        cosa = (cosa < -1)? -1: (cosa > 1)? 1: cosa
        return acos(cosa) * sign(w.z)
      })
      .map((tau, j) => {
        const u = j / (n - 1)
        const phi = (1 - u) * tau
        const c = cos(phi)
        const s = sin(phi)
        const fu = b * sin(u * tau) / sin(tau)
        const xu = fu * (v.x * c - v.y * s) + p0.x
        const yu = fu * (v.x * s + v.y * c) + p0.y
        return new Vector(xu, yu)
      })
      .forEach(p => this.pts.push(p))

      q0 = q1
      q1 = q1._next
    }

    /*
    for (let i = 1; i < this.arcs.length; i++) {
      arc2 = this.arcs[i]

      let tau0 = arc1.tau1,
          tau1 = arc2.tau0,
          t0 = arc1.t1.clone(),
          t1 = arc2.t0,
          p0 = arc1.p1,
          p1 = arc2.p1

      const axis = t0.cross(t1)
      const sgn = sign(axis.z)
      let cosa = t0.dot(t1)
      cosa = (cosa < -1)? -1 : (cosa > 1)? 1 : cosa
      const ang = acos(cosa)
      const v = p1.clone().sub(p0)
      const b = v.mag()
      v.normalize()

      weights
      .map((w, j) => t0.clone().rotateZ(sgn * w * ang))
      .map(t => {
        const w = v.cross(t).normalize()
        let cosa = t.dot(v)
        cosa = (cosa < -1)? -1: (cosa > 1)? 1: cosa
        return acos(cosa) * sign(w.z)
      })
      .map((tau, j) => {
        const u = j / (n - 1)
        const phi = (1 - u) * tau
        const c = cos(phi)
        const s = sin(phi)
        const fu = b * sin(u * tau) / sin(tau)
        const xu = fu * (c * v.x - s * v.y) + p0.x
        const yu = fu * (c * v.y + s * v.x) + p0.y
        return new Vector(xu, yu)
      })
      .forEach(p => this.pts.push(p))

      arc1 = arc2
    }
    */

    // generate the ending arc
    if (!this._poly.closed) {
      this._generateArc(arc2.p1, arc2.p2, arc2.radius, arc2.tau1, sign(arc2.axis.z))
    }
  }

  _generateArc(p0, p1, radius, tau, sgn) {
    const arcResol = 5
    const arcLen = (2 * tau) * radius
    let n = arcLen / arcResol + 0.5 | 0
    if (n < 3) {
      n = 3
    } else if (n > 100) {
      n = 100
    }    
    const v = p1.clone().sub(p0).normalize()
    const b = p0.dist(p1)

    let u, fu, phi, c, s, x, y

    this.pts.push(p0.clone())
    
    for (let i = 1; i < n; i++) {
      u = i / n
      phi = (1 - u) * tau * sgn
      fu = b * sin(u * tau) / sin(tau)
      c = cos(phi)
      s = sin(phi)
      x = fu * (v.x * c + v.y * s) + p0.x
      y = fu * (v.y * c - v.x * s) + p0.y
      this.pts.push(new Vector(x, y))
    }
  }
}
