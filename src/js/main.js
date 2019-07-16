import $ from 'jquery'
import Vector from './vector'
import ControlPolygon from './control-polygon'
import Mouse from './mouse'
import CircleSpline from './circlespline'

const canvas = document.getElementById('geometry')
const ctx = canvas.getContext('2d')
ctx.globalAlpha = 1

const options = {
  blendingMethod: 'trigonometric',
  showPolygon: true,
  showTangents: true,
  showArcs: true
}

const mouse = new Mouse(canvas)
const poly = new ControlPolygon(mouse, options)
const cspline = new CircleSpline(poly, options)

// default control points
poly.add(1 / 4 * canvas.width, 1 / 4 * canvas.height)
poly.add(3 / 4 * canvas.width, 1 / 4 * canvas.height)
poly.add(3 / 4 * canvas.width, 3 / 4 * canvas.height)
poly.add(1 / 2 * canvas.width, 1 / 2 * canvas.height)
poly.add(1 / 4 * canvas.width, 3 / 4 * canvas.height)
// poly.close()

// key bindings
document.addEventListener('keyup', e => {
  switch (e.keyCode) {
    case 46:  // DEL, <fn> + <BACKSPACE> on Mac OS
      poly.removeLast()
      break
    case 65:  // A - toggle arcs on/off
      options.showArcs = !options.showArcs
      $('#display-arcs').prop('checked', options.showArcs)
      break
    case 80:  // P - toggle polygon on/off
      options.showPolygon = !options.showPolygon
      $('#display-polygon').prop('checked', options.showPolygon)
      break
    case 84:  // T - toggle tangents on/off
      options.showTangents = !options.showTangents
      $('#display-tangents').prop('checked', options.showTangents)
      break
  }
})

// GUI event listeners
$('#blending-method')
  .prop('value', options.blendingMethod)
  .change(() => {
    options.blendingMethod = $('#blending-method option:selected').val()
    cspline.update()
  })
$('#display-polygon')
  .prop('checked', options.showPolygon)
  .change(e => options.showPolygon = e.target.checked)
$('#display-arcs')
  .prop('checked', options.showArcs)
  .change(e => options.showArcs = e.target.checked)
$('#display-tangents')
  .prop('checked', options.showTangents)
  .change(e => options.showTangents = e.target.checked)
$('#close-polygon')
  .prop('disabled', poly.count < 3)
  .prop('checked', poly.closed)
  .change(e => {
    poly.close()
  })

// control polygon event handler  
poly.on('modified', () => {
  $('#close-polygon')
    .prop('checked', poly.closed)
    .prop('disabled', poly.count < 3)
})

function draw(time = 0) {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  cspline.render(ctx)
  requestAnimationFrame(draw)
}

draw()
