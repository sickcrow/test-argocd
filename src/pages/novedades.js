import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import Spinner from '../components/spinner'
import urlServer from '../server'
import telefono from '../assets/telefono.svg'
import ReactGA from 'react-ga';

const DateInitFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3/$2/$1 $4:$5:$6').slice(0, -14)} else { return "" } };

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1')} else { return "" } };

export default class Novedades extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        fecha: new Date().toISOString(),
        altasrows: [],
        bajasrows: [],
        modificacionesrows: [],
        temprows: [],
        filtroHoy: '',
        fechaFiltrada: "",
        loading: false,
        rows: [],
        accordion: false,
      }
    }

    reqNovedades = (date) => {

      ReactGA.event({
        category: 'Suscripciones/Novedades',
        action: 'Listar Novedades'
      });

      const fecha = new Date().toISOString().slice(0, -14)
      this.setState({
        loading: true
      })
      this.setState({
        fechaFiltrada: date ? DateFormatter(date) : DateInitFormatter(new Date().toISOString())
      })
      const data = {
        fecha,
        puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id
      }
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }

      fetch(urlServer + "/api/suscripciones/Novedades/Listado", {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers,
      })
      .then(response => {
        if (response.status === 200) {
          return response.text()
        } else {
          const error = new Error(response.status)
          return error
        }
      })
      .catch(error => {
        console.log('error', error)
        this.setState({
          loading: false
        })
      })
      .then(result => {
        let altasrows = []
        let bajasrows = []
        let modificacionesrows = []
        const rows = JSON.parse(result).map(row => {
          if (row.TipoNovedadABC === "A") {
            altasrows = [
              ...altasrows,
              row
            ]
          }
          if (row.TipoNovedadABC === "B") {
            bajasrows = [
              ...bajasrows,
              row
            ]
          }
          if (row.TipoNovedadABC === "C") {
            modificacionesrows = [
              ...modificacionesrows,
              row
            ]
          }
          return row
        })
        this.setState({
          rows,
          temprows: rows,
          altasrows,
          bajasrows,
          modificacionesrows,
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
    
    setLinks = this.props.setLinks

    settingTab = (e) => {
      const flag = e.className.indexOf('active') !== -1 ? true : false
      let tablinks = document.getElementsByClassName("tablinks");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }
      const button = e
      if (!flag) {
        button.className += " active"
      }
    }

    imprimirPDF = async () => {

      ReactGA.event({
        category: 'Suscripciones/Novedades',
        action: 'Exportar Novedades'
      });

      document.getElementById('open-modal').click()
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const dataBody = {
        fecha: new Date().toISOString().slice(0, -14),
        puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
        reporteTipo: 1,
      }
      const respuesta = await fetch(urlServer + "/api/suscripciones/Novedades/Listado", {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(dataBody),
        headers
      }).then(response => {return response.blob()})
      .catch(error => {
        document.getElementById('close-modal').click();
        console.log('error', error);})
      .then(result => {
        document.getElementById('close-modal').click();
        const newBlob = new Blob([result], {type: "application/pdf"});
        const data = window.URL.createObjectURL(newBlob);      
        let link = document.createElement('a');
        link.href = data;
        link.download = 'Novedades-Suscripcion-' + dataBody.fecha + '.pdf'
        link.click()
        setTimeout(function(){
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
        }, 100);
      })
      .catch(error => {
        document.getElementById('close-modal').click();
        console.log('error', error);})
      return await respuesta
    }

    componentDidMount() {
      this.reqNovedades()
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }

    render(){
      const { rows, loading, filtroHoy } = this.state
      
      return ( <div id="Novedades" className="backapp container text-left">
                <Title 
                  title='Novedades'
                />
                <button id="open-modal" type="button" className="btn btn-primary" data-toggle="modal" data-target="#pdf-loader" style={{display: 'none'}}>
                </button>
                <div className="modal fade" id="pdf-loader" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
                <div className="tabs d-flex justify-content-between w-100" style={{borderBottom: '1px solid gray'}}>
                  <div id="altas" className="tablinks col-4 text-center" onClick={(e) => {
                    if (this.state.rows === this.state.altasrows) {
                      this.setState({
                        rows: this.state.temprows
                      })
                    } else {
                      this.setState({
                        rows: this.state.altasrows
                      })
                    }
                    this.settingTab(e.target)
                  }}>Altas</div>
                  <div className="tablinks col-4 text-center" onClick={(e) => {
                    if (this.state.rows === this.state.bajasrows) {
                      this.setState({
                        rows: this.state.temprows
                      })
                    } else {
                      this.setState({
                        rows: this.state.bajasrows
                      })
                    }
                    this.settingTab(e.target)
                  }}>Bajas</div>
                  <div className="tablinks col-4 text-center" onClick={(e) => {
                    if (this.state.rows === this.state.modificacionesrows) {
                      this.setState({
                        rows: this.state.temprows
                      })
                    } else {
                      this.setState({
                        rows: this.state.modificacionesrows
                      })
                    }
                    this.settingTab(e.target)
                  }}>Modificaciones</div>
                </div>
                <div className="d-flex" style={{justifyContent: 'space-evenly', margin: '25px 0px'}}>
                  <div className={"day-tab" + (filtroHoy === "hoy" ? " active" : "")} onClick={() => {
                      if(this.state.filtroHoy === "hoy") {
                        this.setState({
                          filtroHoy: ""
                        })
                      } else {
                        this.setState({filtroHoy: "hoy"})
                      }
                    }}>
                    HOY
                  </div>
                  <div className={"day-tab" + (filtroHoy === "mañana" ? " active" : "")} onClick={() => {
                      if(this.state.filtroHoy === "mañana") {
                        this.setState({
                          filtroHoy: ""
                        })
                      } else {
                        this.setState({filtroHoy: "mañana"})
                      }
                    }}>
                    MAÑANA
                  </div>
                </div>
                <div className="printers">
                  <div className="d-flex" onClick={() => {this.imprimirPDF()}}>
                    <div className="printer">
                      <span>
                        
                      </span>
                    </div>
                    <div className="printer-text">
                      <span>
                        Reporte de novedades
                      </span>
                    </div>
                  </div>
                </div>
                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
                <div className="cards" >
                  {rows.filter(a => filtroHoy ? (filtroHoy === 'hoy' ? a.FechaInformeHoy === true : a.FechaInformeHoy === false) : a).length > 0 ? 
                  rows.map((card, index) => {
                    if (!filtroHoy || ((filtroHoy === 'hoy') === card.FechaInformeHoy)) {
                      return(
                        <div key={index} className="box" style={{color: "#8E95A5"}} >
                          <div className="d-flex justify-content-between" style={{marginBottom: '12px'}} >
                            <div className="f-16" style={{color: '#EA3F3F', fontFamily: 'Roboto', fontWeight: 'bold'}} >
                              {card.ProductoCombinacionDescripcion}
                            </div>
                            <div className="f-13-5">
                              {DateFormatter(card.FechaDeSalida).slice(0, -9)}
                            </div>
                          </div>
                          <div className="d-flex justify-content-between" style={{marginBottom: '12px'}} >
                            <div className="w-50 f-10" style={{paddingTop: '4px'}}>
                              <span className="f-13-5" style={{color: '#224372'}} >
                                {card.Nombre + " " + card.Apellido}
                              </span>
                            </div>
                            {card.Telefono ?
                            <div className="telefono">
                              <a className="d-flex" href={"tel:" + card.suscriptorTelefono}>
                                <ReactSVG style={{marginRight: '5px', height: '10px', width: '10px'}} src={telefono} />
                                <span className="ml-1 f-12" >
                                {card.Telefono}
                                </span>
                              </a>
                            </div>
                            : null}
                          </div>
                          <div className="desc-novedades" style={{marginBottom: '12px'}}>
                            DIR:
                            <span className="ml-1 f-13-5" style={{color: '#343435', fontWeight: '300'}} >
                              {card.DomicilioCalle} {" " + card.DomicilioAltura} {card.DomicilioPiso ? " P: " + card.DomicilioPiso + "º" : ""} {card.DomicilioDepartamentoLocal ? " Dto: " + card.DomicilioDepartamentoLocal : ""} <span className="f-9"> {card.DomicilioEntreCalle1 && card.DomicilioEntreCalle2 ? "(Entre " + card.DomicilioEntreCalle1 + " y " + card.DomicilioEntreCalle2 + ")" : ""}</span>
                            </span>
                          </div>
                          <div className="d-flex" style={{marginBottom: '12px'}}>
                            {card.CantidadLunes ?
                            <span className="dias-novedades">
                              LU {card.CantidadLunes}
                            </span>
                            : ""}
                            {card.CantidadMartes ?
                            <span className="dias-novedades">
                              MA {card.CantidadMartes}
                            </span>
                            : ""}
                            {card.CantidadMiercoles ?
                            <span className="dias-novedades">
                              MI {card.CantidadMiercoles}
                            </span>
                            : ""}
                            {card.CantidadJueves ?
                            <span className="dias-novedades">
                              JU {card.CantidadJueves}
                            </span>
                            : ""}
                            {card.CantidadViernes ?
                            <span className="dias-novedades">
                              VI {card.CantidadViernes}
                            </span>
                            : ""}
                            {card.CantidadSabado ?
                            <span className="dias-novedades">
                              SA {card.CantidadSabado}
                            </span>
                            : ""}
                            {card.CantidadDomingo ?
                            <span className="dias-novedades">
                              DO {card.CantidadDomingo}
                            </span>
                            : ""}
                          </div>
                          <div>
                              <span className="f-10">
                                {card.Tipo}
                              </span>
                          </div>
                        </div>)
                    } else {
                      return ""
                    }

                  }) 
                  : <div className="not-found" >
                    No se encontraron resultados para la fecha {filtroHoy === "mañana" ? DateInitFormatter(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()) : this.state.fechaFiltrada}
                  </div>}
                </div>
                }
              </div>
        )
    }
}