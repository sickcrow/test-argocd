import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import eraser from '../assets/eraser.svg'
import seleccionar from '../assets/seleccionar-reclamos.svg'
import urlServer from '../server'
import Spinner from '../components/spinner';
import telefono from '../assets/telefono.svg'
import ReactGA from 'react-ga';

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} else { return "" } };

const DateApiFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3.$2.$1 $4:$5:$6').slice(0, -9)} else { return "" } };

export default class ListarReclamos extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        reclamoSelected: {},
        busqueda: "",
        initPostReclamos: {
          puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
          fechaDesde: new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
          fechaHasta: new Date().toISOString().slice(0,10),
          pageIndex: 1,
          reclamoGestionarEstadoId: 1,
          pageSize: 0
        },
        postReclamos: {
          puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
          fechaDesde: new Date((new Date()).setDate((new Date()).getDate() - 29)).toISOString().slice(0,10),
          fechaHasta: new Date().toISOString().slice(0,10),
          pageIndex: 1,
          reclamoGestionarEstadoId: 1,
          pageSize: 0
        },
        reclamoAbierto: {},
        ReclamoModalOpen: false,
        fechaDesdeFiltrada: "",
        fechaHastaFiltrada: "",
        loading: false,
        date: {},
        reclamos: [],
        accordion: false,
      }
    }
    
    setLinks = this.props.setLinks

    cerrarReclamoModal = () => {
      this.setState({
        ReclamoModalOpen: false,
      })
    }

    filtrarReclamos = async (data) => {
      this.setState({
        loading: true
      })
      this.setState({
        fechaDesdeFiltrada: DateFormatter(data.fechaDesde),
        fechaHastaFiltrada: DateFormatter(data.fechaHasta)
      })
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const respuesta = await fetch(urlServer + "/api/reclamos/listar", {
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
          reclamos: (JSON.parse(result)),
          loading: false,
        })

        return res
      })
      .catch(error => {console.log('error', error); 
      this.setState({
        loading: false
      })})
      return respuesta
    }

    reqReclamos = async () => {

      ReactGA.event({
        category: 'Reclamos',
        action: 'Listar Reclamos'
      });

      const response = await this.filtrarReclamos(this.state.postReclamos)
      return await response
    }

    clearFilter = () => {
      const fechaDesde = document.getElementById('fecha-desde') ? document.getElementById('fecha-desde') : null
      const fechaHasta = document.getElementById('fecha-hasta') ? document.getElementById('fecha-hasta') : null
      fechaDesde.value = fechaDesde ? '' : null
      fechaHasta.value = fechaHasta ? '' : null
      this.setState({
        postReclamos: this.state.initPostReclamos
      })
    }

    componentDidMount() {
      this.reqReclamos()
      document.title = "Lista de reclamos"
    }

    render(){
      const { reclamos, loading, ReclamoModalOpen } = this.state

      return ( <div id="reclamos" className="backapp container text-left">
                <Title 
                  title='Reclamos'
                  alterAccordion={() => {this.setState({accordion: !this.state.accordion})}}
                  accordion={this.state.accordion}
                />
                <div className={"row overflow-hidden" }>
                  <div className={"filter d-flex justify-content-between overflow-hidden" + (this.state.accordion ? '  mt-0' : ' ')} >
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
                    {ReclamoModalOpen?                     
                    <Redirect push to={{
                      pathname: '/Reclamos/AbrirReclamo',
                      state: {
                        reclamo: this.state.reclamoSelected,
                      }
                    }} />
                    : null}
                    <div style={{width: '33%'}} >
                      <div style={{marginBottom: '12px'}} >
                        Hasta
                      </div>
                      <div>
                        <input id="fecha-hasta" className="form-control filter-input" type="date" onChange={e => this.setState({postReclamos: {...this.state.postReclamos, fechaHasta: e.target.value}})} />
                      </div>
                    </div>
                    <div style={{width: '24%'}} >
                      <div className="eraser" onClick={() => this.clearFilter()}>
                        LIMPIAR
                        <ReactSVG src={eraser} style={{width: '16px'}} />
                      </div>
                      <div style={{width: '100%' }} className="btn button-theme " onClick={() => {this.reqReclamos()}}> Filtrar </div>
                    </div>
                  </div>
                </div>
                <div className="w-100">
                  <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={e => this.setState({busqueda: e.target.value})}/>
                </div>
                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
                <div className="cards">
                  {reclamos.length > 0 ? reclamos.filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((card, index) => {
                    return(
                      <div key={index} className="box" style={{color: "#8E95A5"}} >
                        <div className="d-flex justify-content-between" style={{marginBottom: '18px'}} >
                          <div style={{color: '#EA3F3F', fontWeight: '400', fontSize: '16px'}} >
                            {(card.suscriptorApellido + " " + card.suscriptorNombre).slice(0,20)}
                          </div>
                          <div className="d-flex" style={{fontSize: '13px', marginTop: '-2px'}} >
                            <span className="m-auto">
                              {DateApiFormatter(card.fechaCreacion)}
                            </span>
                          </div>
                        </div>
                        <div className="desc-reclamo" style={{marginBottom: '10px'}} >
                          DIR:
                          <span className="ml-1" >
                            {card.suscriptorDomicilio}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center w-100" style={{marginBottom: '10px'}} >
                          <div className="telefono">
                            <a className="d-flex" href={"tel:" + card.suscriptorTelefono}>
                              <ReactSVG style={{marginRight: '5px', height: '10px', width: '10px'}} src={telefono} />
                              <span className="ml-1" >
                                {card.suscriptorTelefono}
                              </span>
                            </a>
                          </div>
                          <div className="desc-reclamo">
                            Nº REC:
                            <span className="ml-1" >
                              {card.idReclamoSAP} 
                            </span>
                          </div>
                        <div className="desc-reclamo"> 
                          Nº EJEM:
                          <span className="ml-1" >
                            {card.cantidadDespachos}
                          </span>
                        </div>
                        </div>
                        <div>
                          <span className="ml-1 f-13-5" style={{fontWeight: '500'}} >
                            {card.motivo}
                          </span>
                        </div>
                        <div className="d-flex justify-content-end">
                          <span style={{cursor: 'pointer'}} onClick={async () => { 
                            await this.setState({reclamoSelected: reclamos[index]});
                             this.setState({ReclamoModalOpen: true})}}>
                            <ReactSVG className="seleccionar" src={seleccionar} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} />
                          </span>
                        </div>
                      </div>)
                  }) :
                  <div className="not-found" >
                    No se encontraron resultados para la fecha entre {this.state.fechaDesdeFiltrada} y {this.state.fechaHastaFiltrada}
                  </div>}
                </div>}
              </div>
        )
    }
}