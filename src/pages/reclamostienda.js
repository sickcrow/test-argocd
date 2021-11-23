import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import eraser from '../assets/eraser.svg'
import ver from '../assets/ver.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'
import AsyncSelect from 'react-select/async';
import backArrow from '../assets/backArrow.svg';
import ReactGA from 'react-ga';

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} else { return "" } };

const DateApiFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3.$2.$1 $4:$5:$6').slice(0, -9)} else { return "" } };

export default class ReclamosTienda extends React.Component {
    constructor(props){
      super(props);
      this.state = {
          loading: false,
          accordion: false,
          busqueda: "",
          pedidos: [],
          options: [],
          inputValue: "",
          selectedOption: null,
          PedidoModalOpen: false,
          AgregarPedidoOpen: false,
          initReclamos: {
            "fechaDesde": new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
            "fechaHasta": new Date().toISOString().slice(0,10),
            "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
            "reclamoTiendaEstadoId": null
          },
          postReclamos: {
            "fechaDesde": new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
            "fechaHasta": new Date().toISOString().slice(0,10),
            "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
            "reclamoTiendaEstadoId": null
          },
          publicaciones: [],
          verListaReclamos: true,
          datosReclamo: null,
          reset: false
      }
    }

    reclamos = async () => {
      const response = await this.filtrarReclamos(this.state.postReclamos)
      return await response
    }

    clearFilter = async () => {
      await this.setState({
        reset: true
      })
      const fechaDesde = document.getElementById('fecha-desde') ? document.getElementById('fecha-desde') : null
      const fechaHasta = document.getElementById('fecha-hasta') ? document.getElementById('fecha-hasta') : null
      fechaDesde.value = fechaDesde ? "" : null
      fechaHasta.value = fechaHasta ? "" : null
      await this.setState({
        reset: false,
        postReclamos: this.state.initReclamos
      })
    }
  
    filtrarReclamos = async (data) => {

      ReactGA.event({
        category: 'Tienda/Reclamos',
        action: 'Listar Reclamos'
      });

      this.setState({
        loading: true,
        fechaDesdeFiltrada: DateFormatter(data.fechaDesde).slice(0, 10),
        fechaHastaFiltrada: DateFormatter(data.fechaHasta).slice(0, 10)
        
      })
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const respuesta = await fetch(urlServer + '/api/tienda/reclamos/listar', {
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

    verRespuestaReclamo = (card) => {
      this.setState({datosReclamo: card});
      this.setState({verListaReclamos: false});
      //this.props.hideMenu(true);
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

    volverAlListado = () => {
      this.setState({verListaReclamos: true});
      this.setState({accordion: false});
      this.props.hideMenu(false);
    }

    listarEstados = async () => {
      
        try {
          const headers = {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            Authorization: 'bearer ' + localStorage.token
          }

          var response = await fetch(urlServer + '/api/tienda/estadoreclamo/listar', {
          method: 'POST',
          headers
          });

          var result = await response.text();
          var res = JSON.parse(result);

          if(response.status === 200)
          {
            
            let estados = res.map(est => {
              return {value: est.reclamoTiendaEstadoId , label: est.reclamoTiendaEstadoDescripcion }
            });

            estados = [
              {value: null, label: 'Seleccione un estado'},
              ...estados
            ];

            return estados
          }
          else{
              console.log('error al invocar la api de estados de reclamo');
          }

        }catch(error)
        {
          console.log(error);
        }
      
    }

    handleChange = (estado) => {
      this.setState({postReclamos: {
        ...this.state.postReclamos,
        reclamoTiendaEstadoId: estado.value
      }})
    }

    componentDidMount() {
      document.title = "Mis Pedidos"
      this.reclamos()
      this.listarEstados();
    }


    render(){
        const { loading, pedidos, postReclamos, verListaReclamos, datosReclamo, reset } = this.state
        
        return (<div id='pedidos' className="container text-left">
                  
                <div>
                  {verListaReclamos ?
                  <div>
                      <Title 
                        classes=""
                        title='Reclamos'
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
                              postReclamos: {
                                ...this.state.postReclamos, 
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
                            <input id="fecha-hasta"  className="form-control filter-input" type="date" onChange={e => this.setState({postReclamos: { ...this.state.postReclamos, fechaHasta: e.target.value} })} />
                          </div>
                        </div>
                        <div style={{width: '24%'}} >
                          <div className="eraser" onClick={() => this.clearFilter()}>
                            LIMPIAR
                            <ReactSVG src={eraser} style={{width: '16px'}} />
                          </div>
                          <div style={{width: '100%' }} className="btn button-theme " onClick={() => this.filtrarReclamos(postReclamos)}> Filtrar </div>
                        </div>
                      </div>                      
                      
                      <div className="w-100 " style={{marginBottom: '10px'}}>
                          {reset ? 
                          null:
                            <AsyncSelect 
                              cacheOptions
                              loadOptions={this.listarEstados}
                              defaultOptions
                              //placeholder = {"Selecione un Estado"}
                              onChange={this.handleChange}
                            />
                          }
                      </div>

                    </div>
                  </div>
                  
                  <div className="w-100 ">
                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={e => this.setState({busqueda: e.target.value})}/>
                  </div>
                </div>
                :null }



                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
               
                <div>
                    {!verListaReclamos ? // Ver datos de un reclamo
                    <div>
                        <div id="backarrow" className="position-fixed back-arrow-box" onClick={this.volverAlListado}>
                          <ReactSVG style={{position: 'fixed', left:'15px',  width: '13px'}} src={backArrow} />
                        </div>
                          <Title 
                            classes=""
                            title='Detalle del Reclamo'
                            
                          />
                        
                        <div className="box">

                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                  <span style={{color: '#EA3F3F', fontWeight: '500', fontSize: '14px'}}>
                                      {datosReclamo.publicacion}
                                  </span>
                                </div>
                                <div className="desc-reclamo">
                                      ED: 
                                      <span className="ml-1" >
                                         {datosReclamo.edicion.replace('Ed.', '')}
                                      </span>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    N° RECLAMO:
                                    <span className="ml-1" >
                                        {datosReclamo.reclamoId}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    FECHA:
                                    <span className="ml-1" >
                                        {DateApiFormatter(datosReclamo.fechaReclamo)}
                                    </span>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    ESTADO:
                                    <span className="ml-1" >
                                        {datosReclamo.estadoReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    MOTIVO: 
                                    <span className="ml-1" >
                                        {datosReclamo.motivoReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    RESPUESTA: 
                                    <span className="ml-1" >
                                        {datosReclamo.respuestaReclamoTienda}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '10px'}}>
                                <div className="desc-reclamo">
                                    NOTA: 
                                    <span className="ml-1" >
                                        {datosReclamo.respuestaDescripcion}
                                    </span>
                                </div>
                                <div className="desc-reclamo">
                                    
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    :
                    <div className="cards" style={{paddingBottom: '70px'}} >
                      {pedidos.length > 0 ? pedidos.filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((card, index) => {
                        return(
                          <div key={index} className="box" style={{color: "#8E95A5"}} >  

                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '4px'}} >
                                <div className="desc-reclamo" style={{color: '#5775AA', fontWeight: '500', fontSize: '14px'}}>
                                  <span style={{color: '#EA3F3F', fontWeight: '500', fontSize: '14px'}}>
                                    {card.publicacion} 
                                  </span>
                                </div>
                                <div className="desc-reclamo"> 
                                  ED: 
                                  <span className="ml-1" >
                                       {card.edicion.replace('Ed.', '')}
                                  </span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '4px'}} >
                              <div className="desc-reclamo" >
                                N° RECLAMO:
                                <span className="ml-1" >
                                  {card.reclamoId}
                                </span>
                              </div>
                              <div className="desc-reclamo" style={{color: '#5775AA', fontWeight: '500', fontSize: '14px'}}>
                                  
                              </div>
                              <div className="desc-reclamo"> 
                                  FECHA:
                                <span className="ml-1" >
                                 {DateApiFormatter(card.fechaReclamo)}
                                </span>
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '4px'}} >
                              <div className="desc-reclamo">
                                ESTADO:
                                <span className="ml-1" >
                                    {card.estadoReclamoTienda}
                                </span>
                              </div>
                              <div className="desc-reclamo" style={{color: '#5775AA', fontWeight: '500', fontSize: '14px'}}>
                                
                              </div>
                              <div className="desc-reclamo"> 
                                  
                              </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom: '4px'}} >
                              <div className="desc-reclamo" style={{color: '#5775AA', fontWeight: '500', fontSize: '14px'}}>
                                
                              </div>
                              <div className="desc-reclamo" style={{color: '#5775AA', fontWeight: '500', fontSize: '14px'}}>
                                
                              </div>
                              <div className="desc-reclamo"> 
                                    <ReactSVG className="eliminar" src={ver} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} onClick={() => {
                                              this.props.hideMenu(true);
                                              this.verRespuestaReclamo(card);
                                              ReactGA.event({
                                                category: 'Tienda/Reclamos',
                                                action: 'Ver Reclamo'
                                              });
                                              }}/> 
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
                    </div> }

                </div>}
                  
              </div>

          </div>)
    }
}