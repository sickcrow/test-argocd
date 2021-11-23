import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { Redirect } from 'react-router-dom'
import backArrow from '../assets/backArrow.svg'
//import expandir from '../assets/expandir.svg'
import telefono from '../assets/telefono.svg'
import urlServer from '../server'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal)

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1').slice(0, -9)} else { return "" } };

export default class AbrirReclamo extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            reclamo: this.props.props.location.state ? this.props.props.location.state.reclamo : null,
            reclamoAbierto: {},
            //accordion: false,
            respuesta: {
              respuestaDescripcion: ''
            },
            error: [],
            observacion: null,
            reclamosEjemplar: [],
            motivosEjemplar: []
        }
    }
    
    abrirReclamo = async (reclamo) => {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + localStorage.token,
        }
        const data = {
          reclamoMensajeId: reclamo.reclamoMensajeId,
          puntoVentaId: reclamo.puntoVentaId
        }
        const respuesta = await fetch(urlServer + "/api/reclamos/ejemplares/buscar", {
          method: 'POST',
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
        }).then(response => { console.log(response.status); return response.text()})
        .catch(error => {console.log('error', error);})
        .then(result => {
          this.setState({
            reclamoAbierto: JSON.parse(result)
          })
          this.marcarVisualizado(JSON.parse(result).reclamoMensajeId)
          const reclamosEjemplar = JSON.parse(result).listaReclamoEjemplar.map(resultEj => {
            const {
              reclamoMensajeId,
              reclamoMensajeEjemplarId,
              reclamoRespuestaId,
              motivoRespuestaId,
              nota
            } = resultEj
            const returnEj = {
              reclamoMensajeId,
              reclamoMensajeEjemplarId,
              reclamoRespuestaId,
              motivoRespuestaId,
              nota
            } 
            return returnEj
          })          
          this.setState({
            reclamosEjemplar
          })
          return result
        })
        .catch(error => {console.log('error', error); })
        return respuesta
    }

    marcarVisualizado = async (idReclamo) => {
      const url = urlServer + '/api/reclamos/marcarvisualizado/' + idReclamo
      
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }

      const respuesta = await fetch(url, {
        method: 'POST',
        redirect: 'manual',
        headers
      }).then(response => { console.log(response.status); return response.text()})
      .catch(error => {console.log('error', error);})
      .then(result => console.log(result))
      return respuesta
    }

    validarRespuesta = (data) => {
      let validate = true

      let limpiarErrores = [
        "respuesta-general"
      ]

      for (let index = 0; index < data.listaReclamoEjemplar.length; index++) {
        limpiarErrores = [
          ...limpiarErrores,
          "respuesta-" + index,
          "motivo-" + index
        ]
      }

      for (let index = 0; index < limpiarErrores.length; index++) {
        const error = limpiarErrores[index]
        const ejemplar = document.getElementById(error)

        ejemplar.className = ejemplar.className.replace("fill-red", "")
      }

      let error = []

        if (!data.observacion) {
          validate = false
          error = [
            ...error,
            "respuesta-general"
          ]
        }
  
        data.listaReclamoEjemplar.map((ejemplar, index) => {
          if(!ejemplar.reclamoRespuestaId || !ejemplar.motivoRespuestaId) {
            const box = document.getElementById(index)
            box.style = 'border: 1px solid red'

            let borderred = (event) => {
              box.style = ""
              box.removeEventListener('click', borderred)
            }
            box.addEventListener('click', borderred)
            if (!ejemplar.reclamoRespuestaId) {
              validate = false
              error = [
                ...error,
                "respuesta-" + index
              ]
            }
            if (!ejemplar.motivoRespuestaId) {
              validate = false
              error = [
                ...error,
                "motivo-" + index
              ]
            }
          }
        return ejemplar
      })

      for (let index = 0; index < error.length; index++) {
        const errorRed = error[index]
        const ejemplar = document.getElementById(errorRed)
        if (ejemplar.className.indexOf("fill-red") === -1) {
          ejemplar.className += " fill-red"
        }
      }

      console.log(error)
      if (!validate) {
          this.setState({
              error
          })
      }

      return validate
    }

    enviarRespuesta = async () => {
      const { reclamo, reclamosEjemplar, observacion } = this.state
      
      const data = {
        puntoVentaId: reclamo.puntoVentaId,
        reclamoMensajeId: reclamo.reclamoMensajeId,
        observacion: observacion ? observacion : this.state.reclamoAbierto.observacion,
        listaReclamoEjemplar: reclamosEjemplar,
        gestionEstadoId: 2,
        usuarioId: JSON.parse(localStorage.infoToken).usuario_id,
      }

      if (this.validarRespuesta(data)) {

        const url = urlServer + "/api/reclamos/guardar"
        
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + localStorage.token,
        }
        
        const respuesta = await fetch(url, {
          method: 'POST',
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
        }).then(response => { 
          console.log(response, response.status); 
          if(response.status === 200) {
            return response.text()
          } else {
            const error = new Error(response.status)
            return error
          }
        })
        .catch(error => {console.log('error', error);})
        .then(async result => {

          const urlEnviar = urlServer + "/api/reclamos/enviar"
          const dataEnviar = {
            usuarioId: JSON.parse(localStorage.infoToken).usuario_id,
            reclamoIds: (this.state.reclamoAbierto.reclamoMensajeId).toString() + ",",
          }

          await fetch(urlEnviar, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(dataEnviar),
            headers
          }).then(response => { console.log(response.status); return response.text()})
          .catch(error => {console.log('error', error);})
          .then(result => {

            ReactGA.event({
              category: 'Reclamos',
              action: 'Enviar Reclamo'
            });

            this.props.props.history.goBack()
            MySwal.fire({
              icon: 'success',
              title: 'Respuesta de reclamo enviada con éxito',
              showConfirmButton: false,
              timer: 1500
            })
            return result
          })
        })
        return respuesta
      } else {
        
        MySwal.fire({
          icon: 'error',
          title: 'Debe completar los campos obligatorios',
          showConfirmButton: false,
          timer: 1500
        })
      }
      return
    }
       
    componentDidMount() {
      this.props.hideMenu(true)
     
      if (this.state.reclamo) {
       
        ReactGA.event({
          category: 'Reclamos',
          action: 'Gestionar Reclamo'
        });
        
        this.abrirReclamo(this.state.reclamo)
        document.title = "Reclamo " + (this.state.reclamo ? this.state.reclamo.idReclamoSAP : "")
      }

    }
 
    render() {
      if(!this.props.props.location.state) {
        return <Redirect to="/Reclamos"/>
      }
     
      const { reclamoAbierto, error } = this.state
      const { reclamo } = this.props.props.location.state     
     
      return <div>
        <div id="backarrow" class="position-fixed back-arrow-box" className="position-fixed back-arrow-box" onClick={() => { this.props.props.history.goBack() }}>
                     <ReactSVG src={backArrow} />
                </div>
        <div className="container" style={{paddingTop: '10px'}}>                   
                <div className="modal fade" id="errorModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog-centered modal-dialog justify-content-center" role="document">
                    <div className="modal-content" style={{background: '#EA3F3F'}}>
                        <div className="modal-body f-15 text-center" >
                        <ul className="lista-alertas f-12 text-left" style={{color: 'white'}}>
                            {error.map((er, index) => {
                                return <li key={index}> {er} </li>
                            })}
                        </ul>
                        </div>
                        <div className="modal-footer">
                        <button type="button" className="btn btn-secondary f-12" data-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                    </div>
                </div>
                <button type="button" id="error-modal" style={{display: 'none'}} className="btn btn-primary" data-toggle="modal" data-target="#errorModal">
                </button>
                    <div  className="position-sticky" style={{background: 'rgba(0,0,0,0)', top: '46px', zIndex: '3'}}>
                      <div className="backreclamo" style={{ background: 'white', padding: '10px 10px 15px 15px', zIndex: '2', borderRadius: "12px"}}>
                        <div className="d-flex justify-content-between">
                          <h5 className="modal-title f-16 text-left" style={{fontWeight: '400', color: '#EA3F3F'}} id="exampleModalLongTitle">
                              {(reclamo.suscriptorApellido + " " + reclamo.suscriptorNombre)}
                          </h5>
                          <div className="d-flex">
                            <a href={'tel:' + (reclamo.suscriptorTelefono)} className="telefono-reclamo">
                              <ReactSVG src={telefono} />
                            </a>
                          </div>
                        </div>
                        <div className="text-left f-11 mt-2">
                          <span className="motivo-reclamo">
                            {reclamo.motivo}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="box backreclamo" style={{marginTop: '-20px'}}>
                      <div className="backreclamo datos-reclamo overflow-hidden" >
                        <div className="text-left w-200">
                          <div className="desc-reclamo" style={{marginBottom: '10px'}} >
                            DIR:
                            <span className="ml-1" >
                              {reclamo.suscriptorDomicilio}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}} >
                            <div className="desc-reclamo">
                              Nº REC:
                              <span className="ml-1" >
                                {reclamo.idReclamoSAP} 
                              </span>
                            </div>
                            <div className="desc-reclamo"> 
                              Nº EJEM:
                              <span className="ml-1" >
                                {reclamo.cantidadDespachos}
                              </span>
                            </div>
                          </div>
                          <div className="" style={{margin: '', overflowX: 'scroll'}}>
                            <p className="scrollbar f-13-5"  style={{fontWeight: '400', color:'#6D6D6D'}}>
                              {/*this.state.reclamoAbierto.observacionCrm ? this.state.reclamoAbierto.observacionCrm.slice(this.state.reclamoAbierto.observacionCrm.indexOf('\r') + 1,this.state.reclamoAbierto.observacionCrm.indexOf('\r', this.state.reclamoAbierto.observacionCrm.indexOf('\r')+1)) : null*/}
                              {this.state.reclamoAbierto.observacionCrm ? this.state.reclamoAbierto.observacionCrm : null}
                            </p>
                            {/*this.state.reclamoAbierto.observacionCrm ?
                              <div className="datos-reclamo-top d-flex justify-content-between" style={accordion ? { maxHeight: '150px'} : {}}>
                                <p className="f-13-5" style={{maxWidth: "90%"}} >
                                  {this.state.reclamoAbierto.observacionCrm ? this.state.reclamoAbierto.observacionCrm.slice(this.state.reclamoAbierto.observacionCrm.indexOf('\r', this.state.reclamoAbierto.observacionCrm.indexOf('\r')+1), this.state.reclamoAbierto.observacionCrm.length) : null}
                                </p>
                                <div className="position-relative" onClick={() => this.setState({ accordion: !this.state.accordion })}>
                                  <ReactSVG className="expandir" style={ this.state.accordion? { transform: 'rotate(-45deg)'}  : {}} src={expandir} />
                                </div>
                              </div>
                            :null*/}
                          </div>
                        </div>
                      </div>
                      <div id={"respuesta-general"} className="backreclamo text-left f-13-5" style={{fontWeight: '400',background: 'white', padding: '10px 0px 0px 0px'}}>
                        Respuesta del reclamo<span className="primarycolor">*</span>
                        <div className="nota-reclamo d-flex justify-content-between" style={{marginTop: '5px'}}>
                          <input className="col-8 form-control f-12" placeholder="Ingrese una observación" defaultValue={reclamoAbierto.observacion ? reclamoAbierto.observacion : null} disabled={reclamoAbierto.observacion ? true : null} onChange={e => {
                            this.setState({
                              observacion: e.target.value
                            })
                          }} />
                          <button type="button" className="btn reclamo-send f-12 ml-2" onClick={(e) => {e.preventDefault(); this.enviarRespuesta()}}>Enviar</button>
                        </div>
                      </div>
                    </div>
                    {/*<div className="backreclamo" style={{ position: "sticky", marginTop: "0px", top: "105px", height: "19px", borderRadius: "0px 0px 12px 12px", boxShadow: "rgb(224, 224, 224) 0px 2px 1px 0px"}}></div>*/}
                <div id="lista-reclamos-ejemplar">
                    {reclamoAbierto ? (reclamoAbierto.listaReclamoEjemplar ? 
                   
                      reclamoAbierto.listaReclamoEjemplar.map((ejemplar, index) => {
                      return  <div id={index} className="box" key={index}>
                                <div className="d-flex justify-content-between mb-3">
                                  <div className="f-16 primarycolor" style={{fontWeight: '400'}}>
                                    {ejemplar.edicionDescripcion}
                                  </div>
                                  <div className="desc-reclamo">
                                      FECHA ENTREGA:
                                    <span>
                                      {ejemplar.fechaSalida ? DateFormatter(ejemplar.fechaSalida) : ""}
                                    </span>
                                  </div>
                                </div>
                                {JSON.stringify(error).indexOf(index) !== -1 ? <div className="badge badge-danger f-12 w-400 mb-2">Por favor complete este reclamo</div> : null}
                                <div className="d-flex">
                                  <label className="desc-reclamo" id={"respuesta-" + index} style={{marginRight: '6px'}}>
                                    RESPUESTA:
                                    <span className="primarycolor">*</span> 
                                  </label>
                                  {reclamoAbierto.listadoReclamoRespuesta.map((rta, ind) => {
                                    return  <React.Fragment key={ind}>
                                              <br />
                                              <label className="container3" style={ind === 0 ? {marginRight: "5px"}: {}}>{rta.descripcion === 'Aceptado' ? 'No entregado' : 'Entregado'}
                                                <input name={"respuesta-" + index} type="checkbox" disabled={ejemplar.reclamoRespuestaId ? "true" : null} checked={ejemplar.reclamoRespuestaId ? (rta.reclamoRespuestaId === ejemplar.reclamoRespuestaId ? true : false) : null} value={rta.reclamoRespuestaId} onChange={(e) => {
                                                  const value = e.target.checked
                                                  let a = document.getElementsByName("respuesta-" + index)
                                                  for (let i = 0; i <= a.length; i++) {
                                                    if (a[i]) {
                                                      a[i].checked = false 
                                                    }
                                                  }
                                                  e.target.checked = value
                                                  let { reclamosEjemplar } = this.state
                                                  let reclamo = reclamosEjemplar.find(e => e.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                                  let indRec = reclamosEjemplar.findIndex(e => e.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                                  reclamo.reclamoRespuestaId = e.target.checked ? rta.reclamoRespuestaId : null
                                                  reclamo.motivoRespuestaId = null
                                                  document.getElementById('select-motivos').value = "null"
                                                  reclamosEjemplar[indRec] = reclamo
                                                  this.setState({
                                                    reclamosEjemplar
                                                  })
                                                }} />
                                                <span className="checkmark3"></span>
                                              </label>
                                            </React.Fragment>
                                  })}
                                </div>
                                <div className="d-flex">
                                  <label id={"motivo-" + index} className="desc-reclamo" style={{marginRight: '5px'}}>
                                    MOTIVO RTA:<span className="primarycolor">*</span> 
                                  </label>
                                  <select id="select-motivos" disabled={ejemplar.motivoRespuestaId ? true : null} style={{minWidth: '66%', maxWidth: '70%', border: '0', background: 'white'}} value={ejemplar.motivoRespuestaId ? ejemplar.motivoRespuestaId : (this.state.reclamosEjemplar.find(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)? this.state.reclamosEjemplar.find(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId).motivoRespuestaId : "null")} onChange={async (e) => {
                                    let { reclamosEjemplar } = this.state
                                    let reclamo = reclamosEjemplar.find(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                    let indRec = reclamosEjemplar.findIndex(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                    reclamo.motivoRespuestaId = parseInt(e.target.value) ? parseInt(e.target.value) : null
                                    reclamosEjemplar[indRec] = reclamo
                                    await this.setState({
                                      reclamosEjemplar
                                    })
                                  }}>
                                    <option disabled value="null">Seleccione una opción...</option> 
                                    {reclamoAbierto.listadoReclamoRespuestaMotivo.map((motivo, index) => {
                                        let { reclamosEjemplar } = this.state
                                        let reclamo = reclamosEjemplar.find(e => e.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                        if (reclamo && reclamo.reclamoRespuestaId === 1 && motivo.paraAceptado) {
                                          return <option key={index} value={motivo.reclamoRespuestaMotivoId}> {motivo.descripcion} </option>
                                        } else if (reclamo && reclamo.reclamoRespuestaId === 2 && !motivo.paraAceptado) {
                                          return <option key={index} value={motivo.reclamoRespuestaMotivoId}> {motivo.descripcion} </option>
                                        }
                                        return ""
                                      })
                                    }
                                  </select>
                                </div>
                                <div className="nota-reclamo d-flex justify-content-between mt-3">
                                  <input disabled={ejemplar.reclamoRespuestaId ? "true" : null} defaultValue={ejemplar.nota ? ejemplar.nota : null} className="col-12 form-control f-12" placeholder="Escriba una nota" onChange={e => {
                                    let { reclamosEjemplar } = this.state
                                    let reclamo = reclamosEjemplar.find(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                    let indRec = reclamosEjemplar.findIndex(a => a.reclamoMensajeEjemplarId === ejemplar.reclamoMensajeEjemplarId)
                                    reclamo.nota = e.target.value
                                    reclamosEjemplar[indRec] = reclamo
                                    this.setState({
                                      reclamosEjemplar
                                    })
                                  }} />
                                </div>
                              </div>
                    }) 
                    : null) : null}
                </div>
                {reclamoAbierto && reclamoAbierto.listaReclamoEjemplar ? (reclamoAbierto.listaReclamoEjemplar.length > 1 ? 
                
                <div id="boton-enviar" className="row position-relative justify-content-center align-items-center barra-enviar">
                  <button type="button" className="btn reclamo-send f-12" onClick={(e) => {e.preventDefault(); this.enviarRespuesta()}}>Enviar</button>
                </div>: null) : null}
            </div> </div>
    }
}
