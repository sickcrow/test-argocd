import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import eraser from '../assets/eraser.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import Swal from 'sweetalert2';
import backArrow from '../assets/backArrow.svg';
import withReactContent from 'sweetalert2-react-content'
import {Modal} from '@material-ui/core';
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal)

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} else { return "" } };

const DateApiFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3.$2.$1 $4:$5:$6').slice(0, -9)} else { return "" } };

export default class MisPedidosTienda extends React.Component {
    constructor(props){
      super(props);
      this.state = {
          loading: false,
          accordion: false,
          busqueda: "",
          pedidos: [],
          ediciones: [],
          options: [],
          inputValue: "",
          selectedOption: null,
          PedidoModalOpen: false,
          AgregarPedidoOpen: false,
          initPedidos: {
            "fechaDesde": new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
            "fechaHasta": new Date().toISOString().slice(0,10),
            "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
            "productoId": null,
            "edicionId": null,
            "nombreTienda": this.props.props.location.pathname.includes("Tienda") ? "Tienda Agea" : null
          },
          postPedidos: {
            "fechaDesde": new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
            "fechaHasta": new Date().toISOString().slice(0,10),
            "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
            "productoId": null,
            "edicionId": null,
            "nombreTienda": this.props.props.location.pathname.includes("Tienda") ? "Tienda Agea" : null
          },
          publicaciones: [],
          opcionOtros: false,
          opcionOtrosTexto: "",
          motivoValue: null,
          motivoLabel: "",
          pedidoId: null,
          pedidosReclamados: [],
          puedeGenerarReclamo: false,
          open: false,
          mensajeErrorMotivos: "",
          verPantalla: 1,
          reclamo: null
      }
    }

    // state verPantalla adopta los siguientes valores:
    //  1: Pantalla Mis pedidos
    //  2: Pantalla de Seleccion de motivos de reclamo
    //  3: Pantalla Detalle de reclamo

    mostrarMisPedidos = () => {
        this.setState({verPantalla: 1});
        this.setState({accordion: false});
        this.props.hideMenu(false);
    }

    mostrarMotivosReclamo = () => {
      this.setState({verPantalla: 2});
      this.props.hideMenu(true);
    }

    mostrarDetalleReclamo = (reclamoId) => {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token
      }

      const filtro = {
          reclamoId: reclamoId
      };

      const respuesta = fetch(urlServer + '/api/tienda/reclamo/buscar', {
          method: 'POST',
          body: JSON.stringify(filtro),
          headers
      }).then(response => response.text())
      .catch(error => {console.log('error', error); 
      })
      .then(result => {
        const res = JSON.parse(result);
        this.setState({reclamo: res});
        this.setState({verPantalla: 3});
        this.props.hideMenu(true);

        return res
      })
      .catch(error => {
        console.log('error', error); 
        })
      return respuesta
    }

    pedidos = async () => {
      const response = await this.filtrarPedidos(this.state.postPedidos)
      return await response
    }

    clearFilter = () => {
      const fechaDesde = document.getElementById('fecha-desde') ? document.getElementById('fecha-desde') : null
      const fechaHasta = document.getElementById('fecha-hasta') ? document.getElementById('fecha-hasta') : null
      fechaDesde.value = fechaDesde ? "" : null
      fechaHasta.value = fechaHasta ? "" : null
      this.setState({
        postPedidos: this.state.initPedidos
      })
    }
  
    filtrarPedidos = async (data) => {
      
      ReactGA.event({
        category: 'Tienda/MisPedidos',
        action: 'Listar mis Pedidos'
      });
      
      this.setState({
        loading: true,
        fechaDesdeFiltrada: DateFormatter(data.fechaDesde).slice(0, 10),
        fechaHastaFiltrada: DateFormatter(data.fechaHasta).slice(0, 10),
        pedidosReclamados: []
      })
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const respuesta = await fetch(urlServer + '/api/pedidopasadofuturo/Buscar', {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers
      }).then(response => response.text())
      .catch(error => {console.log('error', error); 
      this.setState({
        loading: false
      })})
      .then(result => {
        const res = JSON.parse(result)
        this.setState({
          pedidos: res,
          loading: false
        })
        return res
      })
      .catch(error => {
        console.log('error', error); 
        this.setState({
            loading: false
        })})
      return respuesta
    }

    publicaciones = () => {
      if(this.state.AgregarPedidoOpen) {
        return <Redirect push to={{
          pathname: '/Tienda/CargarPedido'
        }} />
      }
    }

    reqMotivosDeRespuesta = async () => {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: 'Bearer ' + localStorage.token
      }
      
      const url = urlServer + "/api/tienda/motivosreclamo";
      const respuesta = await fetch(url, {
        method: 'POST',
        redirect: 'manual',
        headers
      }).then(response => response.json())
      .then(result => {

        let options = result.map(pub => {
          return {value: pub.motivoReclamoId, label: pub.descripcionMotivo}
        })
        
        return options
      })
      .catch(error => {
        console.log('error', error)
      });
      return respuesta
    }

    handleOpcionOtros = async (motivo) => {
      this.setState({opcionOtrosTexto: ""});
      this.setState({motivoValue: motivo.value});
      this.setState({motivoLabel: motivo.label})
      if(motivo.value === 5)
       {
          this.setState({opcionOtros: true})
       }
       else
       {
          this.setState({opcionOtros: false})
       }
    }

    enviarReclamo = async () => {
        if(this.state.motivoValue === null)
        {
          this.setState({mensajeErrorMotivos: "* Debes seleccionar un motivo de reclamo"});
          this.handleOpen();
          return;
        }
        
        if(this.state.motivoValue === 5 && this.state.opcionOtrosTexto === "")
        {
          this.setState({mensajeErrorMotivos: "* Debes indicar la descripción para el motivo del reclamo"});
          this.handleOpen();
          return;
        }

        const headers = {
          "Content-Type": "application/ json",
          Authorization: "Bearer " + localStorage.token
        }
        const data = {
          motivoReclamoId: this.state.motivoValue,
          descripcionMotivo: this.state.motivoValue === 5 ? this.state.opcionOtrosTexto : this.state.motivoLabel,
          pedidoPasadoId: this.state.pedidoId,
          usuarioId: null
        }

        const url = urlServer + "/api/tienda/generarreclamo";
        const respuesta = await fetch(url, {
          method: "post",
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
        })
        .then(response => 
          {
            if (parseInt(response.status) !== 200) {throw response }

            if(parseInt(response.status) === 200) {
                return response.json()
            } 
          })
        .then(result => {
            let reclamoId = result;

            let pedido = {
              "pedidoId": this.state.pedidoId,
              "nroreclamo": reclamoId
            } 
            // Marco pedido como reclamado
            this.state.pedidosReclamados.push(pedido);

            // Se limpian las variables
            this.setState({motivoValue: null});
            this.setState({opcionOtrosTexto: ""});
            this.setState({opcionOtros: false});
            this.setState({motivoLabel: ""});

            // Cerrar modal
            ReactGA.event({
              category: 'Tienda/Reclamos',
              action: 'Abrir Reclamo'
            });
            
            this.mostrarMisPedidos();

            MySwal.fire({
              title: "Se ha creado con éxito el reclamo N° " +  reclamoId + "!",
              icon: "success",
              confirmButtonText: "Aceptar"
            })
        })
        .catch(err => {
            console.log('Error al intentar enviar reclamo: ', respuesta);
            if (typeof err.text === 'function') {
              err.text().then(errorMessage => {
                var msj=JSON.parse(errorMessage)
                MySwal.fire({
                    icon: 'error',
                    title: msj.message,
                    showConfirmButton: false,
                    timer: 2000
                })})                      
            } else {
                console.log(err)
                MySwal.fire({
                icon: 'error',
                title: 'Ha ocurrido un error.',
                showConfirmButton: false,
                timer: 1500
                })
            }
        });
    }

    reqPublicaciones = async (string) => {
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      if(string) {
        const data = {
          palabraABuscar: string
        }
        const url = urlServer + "/api/producto/buscarPublicaciones"

        const respuesta = await fetch(url, {
          method: 'POST',
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
        })
        .then(response => response.json())
        .then(result => {
          let options = result.map(pub => {
            return {value: pub.productoId, label: pub.descripcion}
          })
          options = [
            {value: null, label: 'Seleccione una publicación'},
            ...options
          ]
          this.setState({
            publicaciones: result,
            options
          })
          return options
        })
        .catch(error => {
          console.log('error', error)
        });
        return respuesta
      } else {
        const data = {
          puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
          fechaDesde: new Date((new Date()).setDate((new Date()).getDate() - 90)).toISOString().slice(0,10),
          fechaHasta: new Date().toISOString().slice(0,10),
          pageIndex: 1,
          pageSize: 12,
        }
        const url = urlServer + "/api/producto/maspedidos/buscar"

        const respuesta = await fetch(url, {
          method: 'POST',
          redirect: 'manual',
          body: JSON.stringify(data),
          headers
        })
        .then(response => response.json())
        .then(result => {
          let options = result.map(pub => {
            return {value: pub.productoId, label: pub.descripcion}
          })
          options = [
            {value: null, label: 'Seleccione una publicación'},
            ...options
          ]
          this.setState({
            publicaciones: result,
            options
          })
          return options
        })
        .catch(error => {
          console.log('error', error)
        });
        return await respuesta
      }
    }

    ediciones = async () => {
      if(this.state.postPedidos.productoId) {
          const headers = {
              "Content-Type": "application/json",
              "Accept": "application/json",
              Authorization: 'Bearer ' + localStorage.token,
          }
          const data = {
              productoId: this.state.postPedidos.productoId,
          }
          const url = urlServer + "/api/edicion/buscarediciones"

          const respuesta = await fetch(url, {
              method: 'POST',
              redirect: 'manual',
              body: JSON.stringify(data),
              headers
          })
          .then(response => response.json())
          .then(result => {
            let options = result.map(ed => {
              return {value: ed.edicionId, label: ed.descripcion}
            })
            options = [
              {value: null, label: 'Seleccione una edición'},
              ...options
            ]
            this.setState({
              ediciones: options
            })
            return options
          })
          .catch(error => {
              console.log('error', error)
          });
          return respuesta
      }
  }

    handleChange = async (newValue) => {
      await this.setState({ 
        postPedidos: {
          ...this.state.postPedidos,
          productoId: newValue.value
        }
      });
      this.ediciones()
      return newValue;
    };

    handleEdicionChange = (selected) => {
      this.setState({
        selectedOption: selected,
        postPedidos: {
          ...this.state.postPedidos,
          edicionId: selected.value
        }
      })
    }

    ocultarFiltros = () =>{
      const div = document.getElementById('filtro')
      let divMarginTop = div.getElementsByClassName('filter')[0]
      const marginTop = divMarginTop.offsetHeight
      if (div.className.indexOf('overflow-hidden') !== -1) {
        divMarginTop.style.marginTop = "0"
        setTimeout(() => {div.className = div.className.replace('overflow-hidden', '')}, 550)
      } else {
        div.className += 'overflow-hidden'
        divMarginTop.style.marginTop = `${-marginTop - 3}px`
      }
    }

    componentDidMount() {
      document.title = "Mis Pedidos"
      this.pedidos()
    }

    handleOpen = () => {
      this.setState({open: true});
    } 

    
    render(){
        const { loading, pedidos, postPedidos, verPantalla, reclamo } = this.state
        
        const handleClose = () => {
            this.setState({open: false})
        };

        return (<div id='pedidos' className="container text-left">
                  {/* Ver pantalla de detalle de reclamo */}
                  {verPantalla === 3 ?
                  <div>
                      <div id="backarrow" className="position-fixed back-arrow-box" onClick={this.mostrarMisPedidos}>
                           <ReactSVG style={{position: 'fixed', left:'15px',  width: '13px'}} src={backArrow} />
                      </div>
                          <Title 
                          classes=""
                          title='Detalle del Reclamo'
                          
                        />
                      <div className="box">
                      <   div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                  <span style={{color: '#EA3F3F', fontWeight: '500', fontSize: '14px'}}>
                                      {reclamo.publicacion}
                                  </span>
                                </div>
                                <div className="desc-reclamo">
                                      ED: 
                                      <span className="ml-1" >
                                        {reclamo.edicion.replace('Ed.', '')}
                                      </span>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    N° RECLAMO:
                                    <span className="ml-1" >
                                        {reclamo.reclamoId}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    FECHA:
                                    <span className="ml-1" >
                                        {DateApiFormatter(reclamo.fechaReclamo)}
                                    </span>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    ESTADO:
                                    <span className="ml-1" >
                                        {reclamo.estadoReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    MOTIVO: 
                                    <span className="ml-1" >
                                        {reclamo.motivoReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    RESPUESTA: 
                                    <span className="ml-1" >
                                        {reclamo.respuestaReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    NOTA: 
                                    <span className="ml-1" >
                                        {reclamo.respuestaDescripcion}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            
                        </div>
                  </div>
                  :null }

                  {/* Pantalla de seleccion de motivos de reclamo */}
                  {verPantalla === 2 ?
                  <div>
                      <div id="backarrow" className="position-fixed back-arrow-box" onClick={this.mostrarMisPedidos}>
                           <ReactSVG style={{position: 'fixed', left:'15px',  width: '13px'}} src={backArrow} />
                      </div>
                    <div className="d-flex justify-content-between header" >
                      <div className="title">
                          Mis Pedidos - Abrir Reclamo
                      </div>
                    </div>

                    <div>
                        <div classes="w-100">
                              <AsyncSelect 
                                cacheOptions
                                loadOptions={this.reqMotivosDeRespuesta}
                                defaultOptions
                                onChange={this.handleOpcionOtros}
                                placeholder = {"Selecione un Motivo"}
                              />
                          </div>
                          {this.state.opcionOtros ? 
                            <div className="w-100 mt-2">
                              <input className="w-100 form-control" type="text" placeholder="Ingresar Motivo" onChange={e => this.setState({opcionOtrosTexto: e.target.value})}/>
                            </div>
                          :null }
                                
                    </div>
                     
                     <div className="d-flex justify-content-center align-items-center barra-enviar">
                        <div className="d-flex justify-content-center align-items-center" 
                          style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "90px", height: "33px"}}
                          onClick={() => {
                              this.setState({motivoValue: null});
                              this.setState({opcionOtrosTexto: ""});
                              this.setState({opcionOtros: false});
                              this.mostrarMisPedidos();
                          }}>Volver</div>
                        &nbsp;
                        <div className="d-flex justify-content-center align-items-center" 
                          style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "100px", height: "33px"}}
                          onClick={() => {
                                this.enviarReclamo();
                                }}>Abrir Reclamo</div>
                    </div>
                  </div>
                  :null }
                  
                  {/* Pantalla de mis pedidos */}
                  {verPantalla === 1 ?
                  <div>
                      <Title 
                        classes=""
                        title='Mis Pedidos'
                        accordion={this.state.accordion}
                        alterAccordion={() => {this.setState({accordion: !this.state.accordion}); this.ocultarFiltros();}}
                      />
                  <button id="open-modal" type="button" className="btn btn-primary" data-toggle="modal" data-target="#loader" style={{display: 'none'}}>
                  </button>
                  <div className="modal fade" id="loader" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered" role="document">
                      <div className="modal-content text-center">
                        <div className="modal-body">
                          <Spinner />
                        </div>
                        Descargando PDF...
                        <div className="modal-footer" style={{display: 'none'}}>
                          <button id="close-modal" type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div id="filtro" className={"row overflow-hidden"}>
                    <div className={"filter"}> 
                      <div className=" d-flex justify-content-between" style={{marginBottom: '10px'}}>
                        <div style={{width: '33%'}} >
                          <div style={{marginBottom: '12px'}} >
                            Desde
                          </div>
                          <div>
                            <input id="fecha-desde" className="form-control filter-input" type="date" onChange={e => {
                            let fechaHasta = document.getElementById('fecha-hasta')
                            fechaHasta.min = e.target.value
                            this.setState({
                              postPedidos: {
                                ...this.state.postPedidos, 
                                fechaDesde: e.target.value,
                                fechaHasta: fechaHasta.value? (e.target.value > fechaHasta.value ? e.target.value : fechaHasta.value) : new Date().toISOString().slice(0,10)
                              }
                            })
                            fechaHasta.value = fechaHasta.value? (e.target.value > fechaHasta.value ? e.target.value : fechaHasta.value) : new Date().toISOString().slice(0,10)
                            }} />
                          </div>
                        </div>
                         {this.publicaciones()}
                        <div style={{width: '33%'}} >
                          <div style={{marginBottom: '12px'}} >
                            Hasta
                          </div>
                          <div>
                            <input id="fecha-hasta"  className="form-control filter-input" type="date" onChange={e => this.setState({postPedidos: { ...this.state.postPedidos, fechaHasta: e.target.value} })} />
                          </div>
                        </div>
                        <div style={{width: '24%'}} >
                          <div className="eraser" onClick={() => this.clearFilter()}>
                            LIMPIAR
                            <ReactSVG src={eraser} style={{width: '16px'}} />
                          </div>
                          <div style={{width: '100%' }} className="btn button-theme " onClick={() => this.filtrarPedidos(postPedidos)}> Filtrar </div>
                        </div>
                      </div>                      
                      
                      <div className="w-100 " style={{marginBottom: '10px'}}>
                        <AsyncSelect 
                          cacheOptions
                          loadOptions={this.reqPublicaciones}
                          defaultOptions
                          onChange={this.handleChange}
                        />
                      </div>
                      {this.state.postPedidos.productoId ?
                      <div className="w-100 ">
                        <Select
                          value={this.state.selectedOption}
                          onChange={this.handleEdicionChange}
                          options={this.state.ediciones}
                        />
                      </div>: null}
                    </div>
                  </div>
                  <div className="w-100 ">
                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={e => this.setState({busqueda: e.target.value})}/>
                  </div>
                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
                <div className="cards" style={{paddingBottom: '70px'}} >
                  {pedidos.length > 0 ? pedidos.filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((card, index) => {
                    return(
                      <div key={index} className="box" style={{color: "#8E95A5"}} >                       
                        <div className="d-flex justify-content-between " style={{marginBottom: '8px'}} >
                          <div style={{color: '#EA3F3F', fontWeight: '500', fontSize: '14px'}} >
                            {(card.publicacion)}
                          </div>
                          <div className="d-flex" style={{color: '#343435', fontSize: '13px',fontWeight: '500', marginTop: '-2px'}} >
                            <span className="m-auto">
                              {DateApiFormatter(card.fechaPedido)}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '4px'}} >
                           <div className="desc-reclamo" >
                            ED:
                            <span className="ml-1" >
                              {card.edicion.replace("Ed. ", "").replace("Ed.", "")}
                            </span>
                          </div>
                          <div className="desc-reclamo">
                            PED:
                            <span className="ml-1" >
                              {card.tipoPedido.replace("Pedido ", "")} 
                            </span>
                          </div>
                          <div className="desc-reclamo"> 
                            Nº EJEM:
                            <span className="ml-1" >
                              {card.cantidadPedida}
                            </span>
                          </div>
                            </div>
                            {card.esDDRcloud === 1 ? /* si es ddrcloud muestra el n ped y el estado en una linea en otra el boton abrir reclamo*/
                                <div className="d-flex justify-content-between align-items-center w-400" style={{ marginBottom: '4px' }}>
                                    {card.tipoPedido !== "Pedido Futuro" ?
                                        <div className="desc-reclamo">
                                            Nº PED:
                                                <span className="ml-1" >
                                                {card.pedidoId}
                                            </span>
                                        </div>
                                        : null}

                                    <div className="desc-reclamo">
                                        ESTADO:
                                <span className="ml-1" >
                                            {card.estado}
                                        </span>
                                    </div>

                                    <div className="desc-reclamo">
                                        <span >
                                            &nbsp;
                                 </span>
                                    </div>
                                </div>
                                : null
                        }
                        <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: "5px"}}>
                          <div>
                              {card.tipoPedido !== "Pedido Futuro" ?
                                        <div className="desc-reclamo">
                                            {card.esDDRcloud === 0 ? /* si no es ddrcloud muestra el n ped y el boton abrir reclamo en una sola linea*/
                                               <span>
                                                    Nº PED:
                                                    <span className="ml-1" >
                                                        {card.pedidoId}
                                                     </span>
                                                </span>
                                            :
                                                <span >
                                                    &nbsp;
                                                </span>
                                            }
                                        </div>
                                : null }
                          </div>
                          <div> 
                                {card.reclamoId === null && this.state.pedidosReclamados.find(x => x.pedidoId === card.pedidoId)?.nroreclamo === undefined?
                                <div>
                                    <span onClick={() => 
                                    {
                                        if(!card.puedeGenerarReclamo === false)
                                        {
                                            this.mostrarMotivosReclamo();

                                        }
                                        else {
                                            MySwal.fire({
                                              title: "No se pueden abrir reclamos antes de transcurridos los cinco días de haber cargado el Pedido!",
                                              text: "",
                                              icon: "error",
                                              confirmButtonText: "Aceptar"
                                            })
                                        }

                                        this.setState({pedidoId: card.pedidoId, puedeGenerarReclamo: card.puedeGenerarReclamo})
                                    }
                                          
                                  } 
                                        style={{
                                          background: "#224372",
                                          color: "white",
                                          fontSize: "12px",
                                          textAlign: "center",
                                          cursor: "pointer",
                                          borderRadius: "16px",
                                          width: "130px",
                                          height: "33px",
                                          padding: "4px"
                                        }}
                                        >Abrir Reclamo
                                       {//} style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "130px", height: "33px", padding: '4px'}}>Cargar Reclamo
                                      }   
                                    </span>
                                </div>
                                :null }
                                {card.reclamoId !== null ?
                                  <div className="desc-reclamo"> 
                                      Nº RECLAMO:
                                      <span className="ml-1" >
                                          {card.reclamoId}
                                      </span>
                                </div>
                              
                                :null }
                                {this.state.pedidosReclamados.find(x => x.pedidoId === card.pedidoId)?.nroreclamo !== undefined ?
                                  <div className="desc-reclamo"> 
                                    Nº RECLAMO:
                                    <span className="ml-1" >
                                      {this.state.pedidosReclamados.find(x => x.pedidoId === card.pedidoId)?.nroreclamo}
                                    </span>
                                  </div>
                                :null }
                          </div>
                          <div>
                              
                              {card.reclamoId !== null || this.state.pedidosReclamados.find(x => x.pedidoId === card.pedidoId)?.nroreclamo !== undefined?
                              <span className="ml-1" >
                                  <span style={{background: "#EA3F3F",
                                          color: "white",
                                          fontSize: "12px",
                                          textAlign: "center",
                                          cursor: "pointer",
                                          borderRadius: "16px",
                                          width: "130px",
                                          height: "33px",
                                          padding: "4px"}} onClick={() => {

                                            ReactGA.event({
                                              category: 'Tienda/Reclamos',
                                              action: 'Ver Reclamo'
                                            });

                                            var reclamoId = null;
                                            if(card.reclamoId !== null)
                                            {
                                              reclamoId = card.reclamoId;
                                            }
                                            else{
                                              reclamoId = this.state.pedidosReclamados.find(x => x.pedidoId === card.pedidoId)?.nroreclamo
                                            }

                                            this.mostrarDetalleReclamo(reclamoId);
                                          }}>Ver Reclamo</span>
                                </span>
                              :null }
                          </div>
                        </div>
                        
                        
                      </div>)
                  }) :
                  <div className="not-found" >
                    No se encontraron resultados para la fecha entre {this.state.fechaDesdeFiltrada} y {this.state.fechaHastaFiltrada}
                  </div>}
                  <div className="d-flex justify-content-center" style={{position: "fixed",bottom: "29px", left: "0", right: "0"}}>
                    <div className="agregar-pedido" onClick={() => this.setState({AgregarPedidoOpen: true})}>+</div>
                  </div>
                </div>}
                  
                  
                    </div>
                    :null }


                  <Modal
                        open={this.state.open}
                        onClose={handleClose}>
                        
                            <div style={{
                                  backgroundColor: '#EA3F3F',
                                  color: 'white',
                                  padding: '20px',
                                  maxWidth: '400px',
                                  width: '85%',
                                  height:'150px',
                                  position: 'fixed',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '15px',
                                  fontFamily: 'roboto',
                                  borderRadius: '5px'
                                  }}>
                                
                                <div align="center">
                                    {this.state.mensajeErrorMotivos}
                                </div>
                                <div align="right" style={{marginTop: '40px'}}>
                                    <button style={{
                                              backgroundColor: '#EA3F3F',
                                              borderWidth: '0px',
                                              color: 'white',
                                              fontSize: '12px'}}
                                      type="button" onClick={handleClose}>
                                      Aceptar
                                    </button>
                                </div>
                            </div>

                      </Modal>

                </div>)
    }
}