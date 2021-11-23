import * as React from 'react'
import { Title } from '../components/title'
import { ReactSVG } from 'react-svg'
import Spinner from '../components/spinner'
import urlServer from '../server'
import restar from '../assets/restar.svg'
import sumar from '../assets/sumar.svg'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ReactGA from 'react-ga';
import './registrarventa.css'
//import { red } from '@material-ui/core/colors'
//import { EditLocation } from '@material-ui/icons'

const MySwal = withReactContent(Swal)

export default class RegistrarVentas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      accordion: false,
      ediciones: [],
      reservas:[],
      seleccionadas: [],
      seleccionadasReserva: [],
      seleccionadasEdicion: [],
      seleccionadasFlag: false,
      busquedaArr: 0,
      resultadosEdiciones: [],
      inputCre: 0,
      inputCd: 0,
      inputCp: 0,
      inputCres: 0,
      mount: true,
      operator: null
    }
  }

  //BÚSQUEDA DE EDICIONES (PARA INICIALIZAR EL CUERPO LISTANDO LAS QUE ENCUENTRE POR DEFAULT Ó PARA EJECUTAR EL FILTRO)
  busquedaEdiciones = async (obj) => {
    ReactGA.event({
      category: 'RegistrarVenta',
      action: 'Listar Ediciones'
    });

    let {busquedaArr} = this.state
    busquedaArr++
    this.setState({
      busquedaArr,
      loading: true
    })
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
    }
    const data = {
        ...obj,
        "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id
    }
    const url = urlServer + "/api/flasheo/edicionVenta/listar"

    const respuesta = await fetch(url, {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers
    })
    .then(response => response.json())
    .then(result => {
      result = result.map(edicion => {
        edicion.cantidadRecibidaInicial = edicion.cantidadRecibida;
        edicion.cantidadDisponibleInicial = edicion.cantidadDisponible;
        edicion.cantidadPerdida = edicion.cantidadPerdida?edicion.cantidadPerdida:0;
        edicion.cantidadPerdidaInicial = edicion.cantidadPerdida;

        return edicion
      })
      if (busquedaArr === this.state.busquedaArr) {
        this.setState({
          ediciones: result,
          loading: false
        })
      }
      return result
    })
    .catch(error => {
      console.log('error', error)
      this.setState({
        loading: false
      })
    });
    return respuesta
  }

  // INICIO FUNCIONES PARA INPUTS Y AUMENTAR-DISMINUIR //

  definirBackgroundInputCre = (inputValue) => {
    if (inputValue === '' ) {
      return 'hsla(14, 100%, 53%, 0.6)'
    } else if (!this.state.mount || inputValue >= 0 ) {
      return 'white'
    }
  }

  definirBackgroundInputCd = (inputValue, cantidadRecibida) => {
    if (inputValue > cantidadRecibida || inputValue === '') {
      return 'hsla(14, 100%, 53%, 0.6)'
    } else if (!this.state.mount || inputValue >= 0 || inputValue <= cantidadRecibida) {
      return 'white'
    }
  }

  definirBackgroundInputCp = (inputValue) => {
    if (inputValue === '' ) {
      return 'hsla(14, 100%, 53%, 0.6)'
    } else if (!this.state.mount || inputValue >= 0 ) {
      return 'white'
    }
  }

  valorInputCre = (cantidadRecibida, cantidadRecibidaInicial) => {
    let { mount } = this.state  
    if (mount) {
        return cantidadRecibidaInicial
      } else {
        return cantidadRecibida
      }
  }

  valorInputCp = (cantidadPerdida, cantidadPerdidaInicial) => {
    let { mount } = this.state  
    if (mount) {
        return cantidadPerdidaInicial
      } else {
        return cantidadPerdida
      }
  }

  valorInputCd = (cantidadDisponible,cantidadDisponibleInicial) => {
    let { mount } = this.state  
    if (mount) {
        return cantidadDisponibleInicial
      } else {
        return cantidadDisponible
      }
  }

  definirBackgroundInputCres = (inputValue) => {
    if (inputValue === '') {
      return 'hsla(14, 100%, 53%, 0.6)'
    } else if (!this.state.mount || inputValue >= 0 ) {
      return 'white'
    }
  }

  valorInputCres = (cantidadSolicitada,cantidadSolicitadaInicial) => {
    let { mount } = this.state  
    if (mount) {
        return cantidadSolicitadaInicial
      } else {
        return cantidadSolicitada
      }
  }

  // FIN FUNCIONES PARA INPUTS Y AUMENTAR-DISMINUIR //

  //BÚSQUEDA DE RESERVA
  busquedaReserva= async (obj) => {
    ReactGA.event({
      category: 'RegistrarVenta',
      action: 'Listar Reservas'
    });

    let {busquedaArr} = this.state
    busquedaArr++
    this.setState({
      busquedaArr,
      loading: true
    })
    
      const headers = {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: 'Bearer ' + localStorage.token,
      }
      const data = {
          ...obj,
          "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id
      }
      const url = urlServer + "/api/flasheo/reservaVenta/listar"
  
      const respuesta = await fetch(url, {
          method: 'POST',
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
      })
      .then(response => response.json())
      .then(result => {
        result = result.map(reserva => {
          reserva.cantidadSolicitadaInicial = reserva.cantidadSolicitada?reserva.cantidadSolicitada:0;

          
          return reserva
        })
        if (busquedaArr === this.state.busquedaArr) {
          this.setState({
            reservas: result,
            loading: false
          })
        }
        return result
      })
      .catch(error => {
        console.log('error', error)
        this.setState({
          loading: false
        })
      });
      return respuesta
  }

  enviarVenta = async () => {

    ReactGA.event({
      category: 'RegistrarVenta',
      action: 'Guardar Venta'
    });

    this.setState({
      loading: true
    })
    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
    }
    const ediciones = this.state.seleccionadas.filter(item => {
      if(item.flasheoEdicionId > 0){
        const {flasheoEdicionId, cantidadRecibida,cantidadDisponible,cantidadPerdida} = item
      
        return {flasheoEdicionId, cantidadRecibida,cantidadDisponible,cantidadPerdida}
      }
    });
    const reservas = this.state.seleccionadas.filter(item => {
      if(item.flasheoReservaId > 0){
        const {flasheoReservaId, cantidadSolicida} = item
      
        return {flasheoReservaId, cantidadSolicida}
      }
    });
    const data = {
        "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
        "ediciones":{ediciones},
        "reservas":{reservas}        
    }

    const url = urlServer + "/api/flasheo/edicionReserva/venta"

    const respuesta = await fetch(url, {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers
    })
    .then(response => response.json())
    .then(result => {
      this.setState({
        loading: false,
        seleccionadasFlag: false,
        seleccionadas: [],
      })
      this.busquedaEdiciones({palabrasABuscar: ""})
      this.busquedaReserva({palabrasABuscar: ""})
      if(typeof(result.message) === "string") {
        MySwal.fire({
          icon: 'success',
          title: result.message,
          showConfirmButton: false,
          timer: 1500
        })
      }
      return result})
    .catch(error => {
      console.log('error', error)
      this.setState({
        loading: false
      })
    });
    return respuesta
  }

  componentDidMount() {
    document.title = "Registrar Ventas"
    this.setState({mount: true})
    this.busquedaEdiciones({palabrasABuscar: ""})
    
    this.busquedaReserva({palabrasABuscar: ""})
  }

  render() {
    const { loading, seleccionadasFlag, seleccionadas, seleccionadasEdicion, seleccionadasReserva } = this.state
    return (
      <React.Fragment>
          <div id='cargarpedido' className="container text-left">
              <div id="registrarventa" className="text-left" style={ seleccionadasFlag && seleccionadas.length > 0 ?  {paddingBottom: '95px'} : {}}>
                <div className="d-flex justify-content-between">
                  <Title 
                    classes="headerRegVenta"
                    title={'Registrar Ventas'}
                    alterAccordion={seleccionadasFlag? null : null }
                  />
                  <div>                 
                    
                  </div>
                </div>
                {/* // AL QUERER VER LOS SELECCIONADOS NO APARECEN LOS FILTROS // */}
                { loading ? 
                    <Spinner style={{fontSize: '8px'}} />
                    :                    
                    (<div>
                          {/* INICIO EDICIONES FLASHEADA  */}
                          {this.state.ediciones.map((edicion, index) => {
                              return (
                                <div key={index} className="boxFlasheo itemTienda" >
                                    <div>
                                        <div style={{color: '#EA3F3F', fontWeight: '400', fontSize: '14px'}} >
                                          {edicion.descripcion}
                                        </div>
                                        <div className=" d-flex justify-content-between align-items-center cardRegVenta" >
                                        
                                            <div className="" style={{paddingBottom:'5px'}} >
                                              <div  style={{marginBottom:'21px',marginTop:'0px'}}>
                                              <div style={{ fontWeight: '400', fontSize: '13.5px', marginBottom: '6px'}}> 
                                                Cantidad recibidas
                                              </div>
                                              <div style={{ fontWeight: '400', fontSize: '13.5px'}}> 
                                                Cantidad disponibles
                                              </div>
                                              </div>
                                              <div style={{ fontWeight: '400', 
                                                            fontSize: '13.5px', 
                                                            color:'#EA3f3f', 
                                                            display:(edicion.cantidadDisponible===0)?'':'none'}}> 
                                                ¿Perdio Ventas? indicar cuantas 
                                              </div>
                                            </div>

                                            {/* BOTONES + o - */}
                                            <div className="" >
                                                <div style={{marginBottom:'11px'}}>
                                                {/* AUMENTAR DISMINUIR cantidadRecibida  */}
                                                <div className="d-flex justify-content-between align-items-center cantidades-container" style={{marginBottom:'2px'}}>
                                                  {/* EL MENOS DE cantidadRecibida  */}
                                                    <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: ((edicion.cantidadRecibida) > 0 && !edicion.esDDRCloud) ? '#F4F4F4' : '#FCFCFC', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={() => {  
                                                                  if (!edicion.esDDRCloud) {
                                                                    let value = document.getElementById(`input-cant-recibida-${edicion.flasheoEdicionId}`).value
                                                                    let aux = value === '' || value === 0 ? 0 : parseInt(value) - 1
                                                                    edicion.cantidadRecibida = parseInt(aux)
                                                                    this.setState({mount: false})
                                                                    let { ediciones, seleccionadas } = this.state
                                                                    let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                                    ediciones[ind] = edicion
                                                                    if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                                      let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                                      seleccionadas[indSel] = edicion
                                                                    } else {
                                                                      seleccionadas = [
                                                                        ...seleccionadas,
                                                                        edicion
                                                                      ]
                                                                    }
                                                                    this.setState({
                                                                      ediciones,
                                                                      seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) || (e.cantidadRecibidaInicial !== e.cantidadRecibida )|| (e.cantidadPerdidaInicial !== e.cantidadPerdida )||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                                    })
                                                                  }}}>
                                                        <ReactSVG src={restar} 
                                                                  style={{color: ((edicion.cantidadRecibida) > 0 && !edicion.esDDRCloud)? '#8E95A5': '#EAEAEA', 
                                                                  width: '11px'}} />
                                                    </div>
                                                      {/* LA CANTIDAD de cantidadRecibida  */}
                                                    <div className="f-13-5">
                                                      <input type="text" className="form-control text-center input-of-cantidades input-CRe" 
                                                      id={`input-cant-recibida-${edicion.flasheoEdicionId}`} aria-label="Sizing example input" 
                                                      aria-describedby="inputGroup-sizing-sm"
                                                      maxLength='3'
                                                       style = {{backgroundColor: this.definirBackgroundInputCre(edicion.cantidadRecibida)}}
                                                       disabled={edicion.esDDRCloud ? true : false}
                                                       value= {this.valorInputCre(edicion.cantidadRecibida, edicion.cantidadRecibidaInicial)}
                                                       onChange={(e) => {
                                                        let { ediciones, seleccionadas } = this.state
                                                        let regex = /[^0-9]/g
                                                        if (regex.test(e.target.value)) {
                                                          e.target.value = e.target.value.replace(regex,'')
                                                        }
                                                        edicion.cantidadRecibida = e.target.value === '' ? '' : parseInt(e.target.value)
                                                        this.setState({ mount: false} )
                                                        let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                        ediciones[ind] = edicion
                                                        if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                          let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                          seleccionadas[indSel] = edicion
                                                        } else {
                                                          seleccionadas = [
                                                            ...seleccionadas,
                                                            edicion
                                                          ]
                                                        }
                                                        this.setState({
                                                          ediciones,
                                                          seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida)
                                                           || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                           || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                           ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                        })
                                                      } }
                                                       ></input>
                                                    </div>
                                                      {/* EL MAS DE cantidadRecibida  */}
                                                    <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: (!edicion.esDDRCloud) ? '#F4F4F4' : '#FCFCFC', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}}
                                                        onClick={() => {
                                                                if(!edicion.esDDRCloud){
                                                                  let value = document.getElementById(`input-cant-recibida-${edicion.flasheoEdicionId}`).value
                                                                  let aux = value === '' ? 1 : value === 999 ? 999 : parseInt(value) + 1
                                                                  edicion.cantidadRecibida = parseInt(aux)
                                                                  this.setState({mount: false})
                                                                  let { ediciones, seleccionadas } = this.state
                                                                  let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                                  ediciones[ind] = edicion
                                                                  if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                                    let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                                    seleccionadas[indSel] = edicion
                                                                  } else {
                                                                    seleccionadas = [
                                                                      ...seleccionadas,
                                                                      edicion
                                                                    ]
                                                                  }
                                                                  this.setState({
                                                                    ediciones,
                                                                    seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) || (e.cantidadRecibidaInicial !== e.cantidadRecibida )|| (e.cantidadPerdidaInicial !== e.cantidadPerdida )||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                                  })
                                                                }}}>
                                                        <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: (!edicion.esDDRCloud && edicion.cantidadRecibida < 999 ) ? '#8E95A5': '#EAEAEA'}} />
                                                    </div>
                                                </div> 

                                                {/* AUMENTAR DISMINUIR cantidadDisponible */}
                                                <div className="d-flex justify-content-between align-items-center cantidades-container" style={{marginBottom:'5px'}}>
                                                  {/* EL MENOS DE cantidadDisponible  */}
                                                  <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: (edicion.cantidadDisponible > 0 )? '#F4F4F4' : '#FCFCFC', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={() => {
                                                          let value = document.getElementById(`input-cant-disp-${edicion.flasheoEdicionId}`).value
                                                          let aux = value === '' || value === 0 ? 0 : parseInt(value) - 1
                                                          edicion.cantidadDisponible = parseInt(aux)
                                                          this.setState({mount: false})
                                                          edicion.cantidadPerdida=0;
                                                          let { ediciones, seleccionadas } = this.state
                                                          let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                          ediciones[ind] = edicion
                                                          if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                            let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                            seleccionadas[indSel] = edicion
                                                          } else {
                                                            seleccionadas = [
                                                              ...seleccionadas,
                                                              edicion
                                                            ]
                                                          }
                                                          this.setState({
                                                            ediciones,
                                                            seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                                                                      || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                                                      || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                                                      ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                          })
                                                        }}>
                                                      <ReactSVG src={restar} style={{color: (edicion.cantidadDisponible > 0)? '#8E95A5': '#EAEAEA', width: '11px'}} />
                                                  </div>
                                                    {/* LA CANTIDAD de cantidadDisponible  */}
                                                  <div className="f-13-5">
                                                    <input  type="text" className="form-control text-center input-of-cantidades input-CD" id={'input-cant-disp-'+`${edicion.flasheoEdicionId}`} aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={this.valorInputCd(edicion.cantidadDisponible,edicion.cantidadDisponibleInicial)} 
                                                            style={{backgroundColor: this.definirBackgroundInputCd(edicion.cantidadDisponible, edicion.cantidadRecibida)}}
                                                            maxLength='3'
                                                            onChange={(e) => {
                                                              let { ediciones, seleccionadas } = this.state
                                                              let regex = /[^0-9]/g
                                                              if (regex.test(e.target.value)) {
                                                                e.target.value = e.target.value.replace(regex,'')
                                                              }
                                                              edicion.cantidadDisponible = e.target.value === '' ? '' : parseInt(e.target.value)
                                                              this.setState({ mount: false} )
                                                              edicion.cantidadPerdida=0;
                                                              let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                              ediciones[ind] = edicion
                                                              if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                                let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                                seleccionadas[indSel] = edicion
                                                              } else {
                                                                seleccionadas = [
                                                                  ...seleccionadas,
                                                                  edicion
                                                                ]
                                                              }
                                                              this.setState({
                                                                ediciones,
                                                                seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida)
                                                                 || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                 || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                 ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                              })
                                                            } } ></input>
                                                  </div>
                                                  {/* EL MAS DE cantidadDisponible  */}
                                                  <div className="d-flex justify-content-center align-items-center"
                                                        style={{cursor: 'pointer', 
                                                                background: '#F4F4F4', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={(e) => {
                                                          let value = document.getElementById(`input-cant-disp-${edicion.flasheoEdicionId}`).value
                                                          let aux = value === '' ? 1 : value === 999 ? 999 : parseInt(value) + 1
                                                          edicion.cantidadDisponible = parseInt(aux)
                                                          this.setState({mount: false })
                                                          let { ediciones, seleccionadas } = this.state
                                                          let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                          ediciones[ind] = edicion
                                                          if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                            let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                            seleccionadas[indSel] = edicion
                                                          } else {
                                                            seleccionadas = [
                                                              ...seleccionadas,
                                                              edicion
                                                            ]
                                                          }
                                                          this.setState({
                                                              ediciones,
                                                              seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                              || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                              || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                              ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                          })
                                                      }}>
                                                      <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: (edicion.cantidadRecibida>edicion.cantidadDisponible && edicion.cantidadDisponible < 999)? '#8E95A5': '#EAEAEA'}} />
                                                  </div>
                                                </div>
                                                </div>
                                                {/* AUMENTAR DISMINUIR cantidadPerdida */}
                                                <div  className={(edicion.cantidadDisponible === 0)?'d-flex justify-content-between align-items-center':'justify-content-between align-items-center cantidades-container'} style={{ display:(edicion.cantidadDisponible=== 0)? '': 'none'}}>
                                                  {/* EL MENOS DE cantidadPerdida  */}
                                                  <div className="d-flex justify-content-center align-items-center"
                                                        disabled= {(edicion.cantidadPerdida > 0 )? false : true} 
                                                        style={{cursor: 'pointer', 
                                                                background: (edicion.cantidadPerdida > 0 )? '#F4F4F4' : '#FCFCFC', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'
                                                              }} 
                                                        onClick={() => {
                                                            let value = document.getElementById(`input-cant-perdida-${edicion.flasheoEdicionId}`).value
                                                            let aux = value === '' || value === 0 ? 0 : parseInt(value) - 1
                                                            edicion.cantidadPerdida = parseInt(aux)
                                                            this.setState({mount: false})
                                                            let { ediciones, seleccionadas } = this.state
                                                            let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                            ediciones[ind] = edicion
                                                            if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                              let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                              seleccionadas[indSel] = edicion
                                                            } else {
                                                              seleccionadas = [
                                                                ...seleccionadas,
                                                                edicion
                                                              ]
                                                            }
                                                            this.setState({
                                                              ediciones,
                                                              seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) || (e.cantidadRecibidaInicial !== e.cantidadRecibida )|| (e.cantidadPerdidaInicial !== e.cantidadPerdida )||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                            })
                                                        }}>
                                                      <ReactSVG src={restar} style={{color: ( edicion.cantidadDisponible===0 &&   edicion.cantidadPerdida > 0)? '#8E95A5': '#EAEAEA', width: '11px'}} />
                                                  </div>
                                                    {/* LA CANTIDAD de cantidadPerdida  */}
                                                  <div className="f-13-5">
                                                    <input type="text" className="form-control text-center input-of-cantidades input-CP" id={'input-cant-perdida-'+`${edicion.flasheoEdicionId}`} aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={this.valorInputCp(edicion.cantidadPerdida,edicion.cantidadPerdidaInicial)} 
                                                        maxLength='3'
                                                        style={{backgroundColor: this.definirBackgroundInputCp(edicion.cantidadPerdida)}}
                                                        onChange={e => {
                                                          let regex = /[^0-9]/g
                                                          if (regex.test(e.target.value)) {
                                                            e.target.value = e.target.value.replace(regex,'')
                                                          }
                                                          edicion.cantidadPerdida = e.target.value === '' ? '' : parseInt(e.target.value)
                                                          this.setState({ mount: false} )
                                                          let { ediciones, seleccionadas } = this.state
                                                          let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                          ediciones[ind] = edicion
                                                          if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                            let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                            seleccionadas[indSel] = edicion
                                                          } else {
                                                            seleccionadas = [
                                                              ...seleccionadas,
                                                              edicion
                                                            ]
                                                          }
                                                          this.setState({
                                                            ediciones,
                                                            seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) || (e.cantidadRecibidaInicial !== e.cantidadRecibida )|| (e.cantidadPerdidaInicial !== e.cantidadPerdida )||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                          })
                                                        }}></input>
                                                  </div>
                                                  {/* EL MAS DE cantidadPerdida  */}
                                                  <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: '#F4F4F4', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={() => {
                                                          let value = document.getElementById(`input-cant-perdida-${edicion.flasheoEdicionId}`).value
                                                          let aux = value === '' ? 1 : value === 999 ? 999 : parseInt(value) + 1
                                                          edicion.cantidadPerdida = parseInt(aux)
                                                          this.setState({mount: false})
                                                          if(edicion.cantidadDisponible === 0){
                                                            let { ediciones, seleccionadas } = this.state
                                                            let ind = ediciones.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                            ediciones[ind] = edicion
                                                            if (seleccionadas.filter(e => e.flasheoEdicionId === edicion.flasheoEdicionId).length !== 0) {
                                                              let indSel = seleccionadas.findIndex(e => e.flasheoEdicionId === edicion.flasheoEdicionId)
                                                              seleccionadas[indSel] = edicion
                                                            } else {
                                                              seleccionadas = [
                                                                ...seleccionadas,
                                                                edicion
                                                              ]
                                                            }
                                                            this.setState({
                                                                ediciones,
                                                                seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                                                                            || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                                                            || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                                                            ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                            })
                                                          }
                                                        }}>
                                                      <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: (edicion.cantidadDisponible === 0 && edicion.cantidadPerdida < 999)? '#8E95A5': '#EAEAEA'}} />
                                                  </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                              )})
                          }
                            <Title 
                            classes="headerReserva"
                            style={{color:"#ff0000"}}
                            title={'Reservas'}
                            classTitle="titleReserva"
                            alterAccordion={seleccionadasFlag? null : null }
                          />                          
                          {/* // FIN EDICIONES FLASHEADA */}

                          {/* // INICIO RESERVA FLASHEADA  */}
                          {this.state.reservas.map((reserva, index) => {
                              return (
                                <div key={index} className="boxFlasheo itemTienda" >
                                    <div>
                                        <div style={{color: '#EA3F3F', fontWeight: '400', fontSize: '14px'}} >
                                         ¿Tenes Reserva para {reserva.descripcion}?
                                        </div>
                                        <div className=" d-flex justify-content-between align-items-center cardRegVenta" >
                                        
                                            <div className="" >
                                              <div style={{ fontWeight: '400', fontSize: '13.5px', marginBottom: '0px'}}> 
                                                indicar cuantas
                                              </div>
                                          </div>

                                            {/* BOTONES RESERVA + o - */}
                                            <div className="" >
                                                {/* AUMENTAR DISMINUIR CANTIDAD RESERVA  */}
                                                <div className="d-flex justify-content-between align-items-center cantidades-container" style={{width: '120px', minWidth: '88px', margin: 0}}>
                                                  {/* EL MENOS DE cantidadReservada  */}
                                                    <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: ((reserva.cantidadSolicitada) > 0 ) ? '#F4F4F4' : '#FCFCFC', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={() => {
                                                                  let value = document.getElementById(`input-cant-reservada-${reserva.flasheoReservaId}`).value
                                                                  let aux = value === '' || value === 0 ? 0 : parseInt(value) - 1
                                                                  reserva.cantidadSolicitada = parseInt(aux)
                                                                  this.setState({mount: false})
                                                                  let { reservas, seleccionadas } = this.state
                                                                  let ind = reservas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                                  reservas[ind] = reserva
                                                                  if (seleccionadas.filter(e => e.flasheoReservaId === reserva.flasheoReservaId).length !== 0) {
                                                                    let indSel = seleccionadas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                                    seleccionadas[indSel] = reserva
                                                                  } else {
                                                                    seleccionadas = [
                                                                      ...seleccionadas,
                                                                      reserva
                                                                    ]
                                                                  }
                                                                  this.setState({
                                                                    reservas,
                                                                    seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                                                                                            || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                                                                            || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                                                                            ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                                  })
                                                                }}>
                                                        <ReactSVG src={restar} 
                                                                  style={{color: ((reserva.cantidadSolicitada) > 0 )? '#8E95A5': '#EAEAEA', 
                                                                  width: '11px'}} />
                                                    </div>
                                                      {/* LA CANTIDAD de cantidadReservada  */}
                                                    <div className="f-13-5">
                                                      <input type="text" className="form-control text-center input-of-cantidades input-CRes" id={`input-cant-reservada-${reserva.flasheoReservaId}`} aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value={this.valorInputCres(reserva.cantidadSolicitada,reserva.cantidadSolicitadaInicial)} 
                                                          maxLength='3'
                                                          style={{backgroundColor: this.definirBackgroundInputCres(reserva.cantidadSolicitada)}}
                                                          onChange={e => {
                                                            let regex = /[^0-9]/g
                                                            if (regex.test(e.target.value)) {
                                                              e.target.value = e.target.value.replace(regex,'')
                                                            }
                                                            reserva.cantidadSolicitada = e.target.value === '' ? '' : parseInt(e.target.value)
                                                            this.setState({mount: false})
                                                            let { reservas, seleccionadas } = this.state
                                                            let ind = reservas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                            reservas[ind] = reserva
                                                            if (seleccionadas.filter(e => e.flasheoReservaId === reserva.flasheoReservaId).length !== 0) {
                                                              let indSel = seleccionadas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                              seleccionadas[indSel] = reserva
                                                            } else {
                                                              seleccionadas = [
                                                                ...seleccionadas,
                                                                reserva
                                                              ]
                                                            }
                                                            this.setState({
                                                              reservas,
                                                              seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                                                                                      || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                                                                      || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                                                                      ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                            })
                                                          }}></input>   
                                                    </div>
                                                      {/* EL MAS DE cantidadReservada  */}
                                                    <div className="d-flex justify-content-center align-items-center" 
                                                        style={{cursor: 'pointer', 
                                                                background: '#F4F4F4', 
                                                                width: '26px', 
                                                                height: '26px', 
                                                                borderRadius: '50%'}} 
                                                        onClick={() => {
                                                                  let value = document.getElementById(`input-cant-reservada-${reserva.flasheoReservaId}`).value
                                                                  let aux = value === '' ? 1 : value === 999 ? 999 : parseInt(value) + 1
                                                                  reserva.cantidadSolicitada = parseInt(aux)
                                                                  this.setState({mount: false})
                                                                  let { reservas, seleccionadas } = this.state
                                                                  let ind = reservas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                                  reservas[ind] = reserva
                                                                  if (seleccionadas.filter(e => e.flasheoReservaId === reserva.flasheoReservaId).length !== 0) {
                                                                    let indSel = seleccionadas.findIndex(e => e.flasheoReservaId === reserva.flasheoReservaId)
                                                                    seleccionadas[indSel] = reserva
                                                                  } else {
                                                                    seleccionadas = [
                                                                      ...seleccionadas,
                                                                      reserva
                                                                    ]
                                                                  }
                                                                  
                                                                  this.setState({
                                                                    reservas,
                                                                    seleccionadas: seleccionadas.filter(e => (e.cantidadDisponibleInicial !== e.cantidadDisponible && e.cantidadDisponible <= e.cantidadRecibida) 
                                                                                                                            || (e.cantidadRecibidaInicial !== e.cantidadRecibida )
                                                                                                                            || (e.cantidadPerdidaInicial !== e.cantidadPerdida )
                                                                                                                            ||(e.cantidadSolicitadaInicial !== e.cantidadSolicitada))
                                                                  })
                                                                  console.log(seleccionadas.filter(e => e.flasheoReservaId >= 0))
                                                                }}>
                                                        <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: (reserva.cantidadSolicitada < 999) ?  '#8E95A5' : '#EAEAEA'}} />
                                                    </div>
                                                </div> 

                                             </div>
                                        </div>
                                    </div>
                                </div>
                              )})
                          }
                          {/* FIN RESERVA FLASHEO */}
                    </div>)
                }

                {/* BOTON ENVIAR */}
                {
                  (seleccionadas.filter(e => e.flasheoEdicionId >= 0).length > 0 
                  && seleccionadas.filter(e => e.flasheoEdicionId >= 0).every(e => e.cantidadDisponible <= e.cantidadRecibida )
                  && seleccionadas.filter(e => e.flasheoEdicionId >= 0).every(e => e.cantidadDisponible !== '' )
                  && seleccionadas.filter(e => e.flasheoEdicionId >= 0).every(e => e.cantidadRecibida !== '' )
                  && seleccionadas.filter(e => e.flasheoEdicionId >= 0).every(e => e.cantidadPerdida !== '' )) 
                || (seleccionadas.filter(e => e.flasheoReservaId >= 0).length > 0
                  && seleccionadas.filter(e => e.flasheoReservaId >= 0).every(e => e.cantidadSolicitada !== '' )) ? 
                  <div id="boton-enviar" className="d-flex justify-content-center align-items-center barra-enviar">
                      <div className="d-flex justify-content-center align-items-center btn-enviar" onClick={() => this.enviarVenta()}>Guardar</div>
                  </div>
                  : null
                }
              </div>
          </div>
      </React.Fragment>
    )
  }
}