import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import eraser from '../assets/eraser.svg'
import Spinner from '../components/spinner'

export default class Maestro extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        filtro: {
          fechaNovedadDesde: '',
          fechaNovedadHasta: ''
        },
        loading: false,
        rows: [
          {
            name: 'Germán Cicchini',
            date: '06.01.2020',
            pub: 'Olé',
            address: 'Cabildo 1250 3B'
          },
          {
            name: 'Franco Vega',
            date: '06.01.2020',
            pub: 'Rolling Stones',
            address: 'Riglos 525 11A'
          },
          {
            name: 'Germán Cicchini',
            date: '06.01.2020',
            pub: 'Olé',
            address: 'Cabildo 1250 3B'
          },
          {
            name: 'Franco Vega',
            date: '06.01.2020',
            pub: 'Rolling Stones',
            address: 'Riglos 525 11A'
          },
          {
            name: 'Germán Cicchini',
            date: '06.01.2020',
            pub: 'Olé',
            address: 'Cabildo 1250 3B'
          },
          {
            name: 'Franco Vega',
            date: '06.01.2020',
            pub: 'Rolling Stones',
            address: 'Riglos 525 11A'
          },
        ],
        accordion: false,
      }
    }
    
    setLinks = this.props.setLinks

    Maestro = (date) => {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", "Bearer " + localStorage.token);
      myHeaders.append("Content-Type", "application/json");
      this.setState({
        loading: true
      })

      let raw = {}

      raw.fechaNovedadDesde = "0"
      raw.fechaNovedadHasta = `"${new Date().toISOString()}"`

      if (date) {
        raw.fechaNovedadDesde = date.fechaNovedadDesde
        raw.fechaNovedadHasta = date.fechaNovedadHasta
      }

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(raw),
        redirect: 'manual'
      };

      fetch("http://qaapi-green.kioscos.ddrcloud.com.ar/api/suscripciones/Buscar", requestOptions)
        .then(response => response.text())
        .catch(error => {
          console.log('error', error)
          this.setState({
            loading: false
          })
        })
        .then(result => {
          this.setState({
            rows: (JSON.parse(result)).rows,
            loading: false
          })
        })
        .catch(error => {
          console.log('error', error)
          this.setState({
            loading: false
          })
        });
    }

    clearFilter = () => {
      const desde = document.getElementById('desde') ? document.getElementById('desde') : null
      const hasta = document.getElementById('hasta') ? document.getElementById('hasta') : null
      desde.value = desde ? '' : null
      hasta.value = hasta ? '' : null
      this.setState({
        filtro: {
          ...this.state.filtro,
          fechaNovedadDesde: null,
          fechaNovedadHasta: null
        }
      })
    }

    componentDidMount() {
      this.Maestro()
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }

    render(){
      const { rows, filtro, loading } = this.state
      
      return ( <div className="maestro container text-left">
                <Title 
                  title='Maestro de Suscripciones'
                  classes=''
                  alterAccordion={() => {this.setState({accordion: !this.state.accordion})}}
                />
                <div className="row overflow-hidden">
                  <div className={"filter overflow-hidden" + (this.state.accordion ? '  mt-0' : ' ')} >
                    <div className="d-flex justify-content-between" >
                      <div style={{width: '33%'}} >
                          <div style={{marginBottom: '12px'}} >
                          Desde
                          </div>
                          <div>
                          <input id="desde" className="form-control px-2 filter-input" type="date" onChange={e => this.setState({filtro: { ...filtro, fechaNovedadDesde: e.target.value} })} />
                          </div>
                      </div>
                      <div style={{width: '33%'}} >
                          <div style={{marginBottom: '12px'}} >
                          Hasta
                          </div>
                          <div>
                          <input id="hasta" className="form-control px-2 filter-input" type="date" onChange={e => this.setState({filtro: { ...filtro, fechaNovedadHasta: e.target.value} })} />
                          </div>
                      </div>
                      {/* <div>
                          <select defaultValue="" className="selectpicker" data-live-search="true" placeholder="Seleccione una opción"> 
                          <option value="" disabled>Seleccione una opción</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="gestionado">Gestionado</option>
                          </select>
                      </div> */}
                      <div style={{width: '24%'}} >
                          <div className="eraser" onClick={() => {this.clearFilter()}} >
                            LIMPIAR
                            <ReactSVG src={eraser} style={{width: '16px'}} />
                          </div>
                          <div style={{width: '100%' }} className="btn button-theme " onClick={() => {this.Maestro(filtro)}}> Filtrar </div>
                      </div>
                    </div>
                    <div className="w-100" style={{marginTop: '20px'}}>
                      <select defaultValue="" style={{height: '34px', borderRadius: '6px', paddingLeft: '10px'}} className="selectpicker w-100" data-live-search="true" placeholder="Publicación"> 
                        <option value="" disabled>Publicación</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="gestionado">Gestionado</option>
                      </select>
                    </div>
                    <div className="w-100" style={{marginTop: '20px'}}>
                      <select defaultValue="" style={{height: '34px', borderRadius: '6px', paddingLeft: '10px'}} className="selectpicker w-100" data-live-search="true" placeholder="Suscriptor"> 
                        <option value="" disabled>Suscriptor</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="gestionado">Gestionado</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="w-100 ">
                  <input className="w-100 form-control" type="text" placeholder="Buscar" />
                </div>
                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
                <div className="cards " style={{paddingBottom: '70px'}} >
                  
                  {rows.length > 0 ? 
                  rows.map((card, index) => {
                    return(
                      <div key={index} className="box" style={{color: "#8E95A5"}} >
                        <div className="d-flex justify-content-between" style={{marginBottom: '20px'}} >
                          <div style={{color: '#EA3F3F', fontFamily: 'Roboto', fontWeight: 'bold', fontSize: '16px'}} >
                            {card.productoCombinacionDescripcion}
                          </div>
                          <div style={{fontSize: '13px'}} >
                            {card.fechaCombinada ? <React.Fragment>
                                                      {card.fechaCombinada.slice(0, card.fechaCombinada.indexOf('<'))} < br/>
                                                      {card.fechaCombinada.slice(card.fechaCombinada.indexOf('>') + 1)}                        
                                                    </React.Fragment> : ""}
                          </div>
                        </div>
                        <div className="d-flex" >
                          <div className="w-50" style={{fontSize: '10px'}} >
                            SUB
                            <span className="ml-1" style={{fontSize: '12px', color: '#343435'}} >
                              {card.nroSuscriptorEditor + "-" + card.nroSuscriptorSDDRA}<br />
                              {card.suscriptorDescripcion}
                            </span>
                          </div>
                          <div className="w-50" style={{fontSize: '10px'}} >
                            Dir
                            <span className="ml-1" style={{fontSize: '12px', color: '#343435'}} >
                              {card.domicilioCalle ? card.domicilioCalle : ""}
                              {card.domicilioAltura ?  " " + card.domicilioAltura : ""}
                              {card.localidadDescripcion ? " " + card.localidadDescripcion : "" }
                            </span>
                          </div>
                        </div>
                      </div>)

                  })
                  : 'No se encontraron resultados'
                  }
                </div>}
              </div>
        )
    }
}