
import * as React from 'react'
import Quagga from 'quagga'

export default class Scanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
        resultadoCodigoBarras: [],
    }
  }

  outTarget = e => {
      const modal = document.getElementById('ventanascanner')
      const botonbarras = document.getElementById('botonbarras')
      const botonvisible = document.getElementById('botonvisible')
      if ((e.target !== botonbarras && e.target !== botonvisible && !modal.contains(e.target)) || e.target.tagName === "CANVAS") {
        console.log('saliendo outtarget')
        const closebutton = document.getElementById('closebutton')
        if(closebutton) {
          closebutton.click()
        }
        this.props.closeModal()
      }
  }

  onDetected = (result) => {
    if(this._isMounted) {
      this.setState({
        resultadoCodigoBarras: [
          ...this.state.resultadoCodigoBarras,
          result.codeResult.code
        ]
      })
    }
  };

  componentDidMount() {
    this._isMounted = true
    Quagga.init({
      inputStream : {
        name : "Live",
        type : "LiveStream",
        target: document.querySelector('#camarabarras'),    // Or '#yourElement' (optional)
        constraints: {
            width: 300,
            height: 400,
            facingMode: "environment" // or user
        }
      },
      decoder : {
        readers : ["ean_reader"]
      }
    }
    , function(err) {
        if (err) {
            console.log(err);
            return
        }
        Quagga.start();
    });

    Quagga.onProcessed(result => {
      var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            Number(drawingCanvas.getAttribute("width")),
            Number(drawingCanvas.getAttribute("height"))
          );
          result.boxes
            .filter(function(box) {
              return box !== result.box;
            })
            .forEach(function(box) {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: "green",
                lineWidth: 2
              });
            });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2
          });
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: "x", y: "y" },
            drawingCtx,
            { color: "red", lineWidth: 3 }
          );
        }
      }
    });

    Quagga.onDetected(async result => {
      if(result.codeResult.code) {
        let { resultadoCodigoBarras } = this.state

        if(resultadoCodigoBarras.filter(e => e === result.codeResult.code).length < 10) {
          this.onDetected(result)
        } else {
          if(this._isMounted) {
            this.props.onDetectedCode(result.codeResult.code)
          }
          console.log(result.codeResult.code)
          const closebutton = document.getElementById('closebutton')
          await this.setState({
            resultadoCodigoBarras: [],
          })
          if(closebutton) {
            closebutton.click()
          }
          Quagga.stop()
          this.props.closeModal()
        }
      }
    });
    document.addEventListener('click', this.outTarget)
  }

  async componentWillUnmount() {
    this.props.closeModal()
    document.removeEventListener('click', this.outTarget)
    Quagga.stop()
    await this.setState({
      resultadoCodigoBarras: [],
    })
    this._isMounted = false
  }

  render() {
    return (
        <div>
            <div className="modal fade codigodebarras" id="codigodebarras" tabIndex="-1" role="dialog" aria-labelledby="codigodebarrasLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div id="ventanascanner" className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="codigodebarrasLabel">Escanear código de barras</h5>
                      <button id="closebutton" type="button" className="close" data-dismiss="modal" onClick={() => {
                          this.props.closeModal()
                      }} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div className="camarabarras position-relative modal-body" id="camarabarras">
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => {
                          this.props.closeModal()
                      }} data-dismiss="modal">Cerrar</button>
                    </div>
                  </div>
                </div>
              </div>
        </div>
    )
  }
}