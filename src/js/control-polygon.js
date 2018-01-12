import { EventEmitter } from 'events'
import ControlPoint from "./control-point"
import Vector from "./vector"

const { pow, sqrt } = Math
const DTOL = 3

// implements a double-linked list of draggable control points

export default class ControlPolygon extends EventEmitter {
  constructor(mouse, options) {
    super()

    this.options = options
    this.mouse = mouse
    this.count = 0
    this.closed = false
    this._start = null
    this._last = null
    this._over = null
    this._dragging = false

    mouse
    .on('move', (x, y) => this._onMouseMove(this.mouse.pos))
    .on('down', btn => {
      if (btn === 0) {
        this._onMouseDown(this.mouse.pos, btn)
      }else if (btn === 2) {
        this._removeSelected()
      }
    })
    .on('up', btn => this._onMouseUp(this.mouse.pos, btn))
  }

  add(x, y, z = 0) {
    return this._addAfter(this._last, x, y, z)
  }

  _addAfter(q, x, y, z = 0) {
    const p = new ControlPoint(x, y, z)
    if (q) {
      let next = q._next
      q._next = p
      p._prev = q
      p._next = next
      if (next) {
        next._prev = p
      }
      if (q === this._last) {
        this._last = p
      }   
    }else {
      this._start = p
      this._last = p
    }
    this.count++
    this.emit('modified', p)
    return p
  }

  removeLast() {
    if (this.count === 0) { return }
    let last = this._last
    if (this._over === last) {
      this._over = null
      this._dragging = false
    }
    if (last) {
      let p = last._prev
      if (p) {
        p._next = null
      }
      this._last = p  
    }
    last = null
    this.count--
    if (this.count === 0) {
      this._start = null;
    }
    this.emit('modified', null)
  }

  _removeSelected() {
    if (!this._over) { return }
    let prev = this._over._prev
    let next = this._over._next
    if (prev) {
      prev._next = next
    }else {
      this._start = next
    }
    if (next) {
      next._prev = prev
    }else {
      this._last = prev
    }
    this._over = null
    this._dragging = false
    this.count--
    this.emit('modified', null)
  }

  render(ctx) {
    if (!this._start) { return }
    if (this._start !== this._last) {
      ctx.beginPath()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      let q = this._start
      ctx.moveTo(q.v.x, q.v.y)
      while (q = q._next) {
        ctx.lineTo(q.v.x, q.v.y)
      }
      ctx.stroke()  
    }
    /*let q = this._start
    while (q) {
      q.render(ctx)
      q = q._next
    }*/  
  }

  _onMouseMove(p) {
    if (this._over && this._dragging) {
      this._over.moveTo(p.x, p.y, p.z)
      this.emit('modified', this._over)      
    }else {
      let q = this._start
      while (q) {
        if (q.isPointInside(p)) {
          this._over = q
          q.selected = true
          this.mouse.setCursor('pointer')
          return
        }else {
          q.selected = false
        }
        q = q._next
      }
      if (this._over) {
        this._over.selected = false
      }
      this._over = null  
      this.mouse.resetCursor()
    }
  }

  _onMouseDown(p, btn) {
    if (btn !== 0) { return }

    if (!this._over) {
      // A new point can be added after the last point or in between two existing points
      let inside = false

      // TODO: run this code when hovering the polygon edges

      if (this.count > 1 && this.options.showPolygon) {
        let q1 = this._start
        let q2 = q1._next
        let v1 = new Vector()
        let v2 = new Vector()
        let pp = new Vector()
        let len, a, d

        while (q2 = q1._next) {
          v1.set(q2.v.x - q1.v.x, q2.v.y - q1.v.y)
          v2.set(p.x - q1.v.x, p.y - q1.v.y)
          len = v1.mag()
          v1.scale(1 / len)
          a = v1.dot(v2)
          if (a > 0 && a < len) {
            pp.set(q1.v.x + a * v1.x, q1.v.y + a * v1.y)
            d = p.distSq(pp)
            inside = d < (DTOL * DTOL)
            if (inside) {
              inside = true
              this._over = this._addAfter(q1, p.x, p.y)
              this._dragging = true
              this._over.selected = true
              this.mouse.setCursor('pointer')
              // this.emit('modified', this._over)
              return
            }
          }
          q1 = q2
        }
      }

      if (!inside) {
        this._over = this.add(p.x, p.y, p.z)
        this._over.selected = true
        // this.emit('modified', this._over)
      }
    }
    this._dragging = true
    this.mouse.setCursor('pointer')
  }

  _onMouseUp(p, btn) {
    if (btn !== 0) { return }
    if (this._over && this._dragging) {
      this._over.moveTo(p.x, p.y, p.z)
    }
    this._dragging = false
  }
}
