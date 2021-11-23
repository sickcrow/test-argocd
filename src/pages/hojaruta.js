import * as React from 'react';
import { Title } from '../components/title'
import Spinner from '../components/spinner'
import urlServer from '../server'
import ReactGA from 'react-ga';

const DateInitFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3/$2/$1 $4:$5:$6').slice(0, -14)} else { return "" } };

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} else { return "" } };

export default class HojaRuta extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        fecha: new Date().toISOString(),
        fechaFiltrada: "",
        loading: false,
        rows: [],
        accordion: false,
      }
    }

    reqHojaRuta = (date) => {

      ReactGA.event({
        category: 'Suscripciones/HojaDeRuta',
        action: 'Listar Hoja de Ruta'
      });

      const fecha = date ? date : `${new Date().toISOString()}`
      this.setState({
        loading: true
      })
      this.setState({
        fechaFiltrada: date ? DateFormatter(date) : DateInitFormatter(new Date().toISOString())
      })
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const data = {
        fecha,
        reporteTipo: null,
        puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id
      }

      fetch(urlServer + "/api/suscripciones/HojaRuta/listado", {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers,
      })
      .then(response => {
        if (parseInt(response.status) === 200) {
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

        this.setState({
          rows: (JSON.parse(result))  ,
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

    imprimirHojaRuta = async () => {

      ReactGA.event({
        category: 'Suscripciones/HojaDeRuta',
        action: 'Exportar Hoja de Ruta'
      });

      document.getElementById('open-modal').click()
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const dataBody = {
        reporteTipo: 1,
        puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
        fecha: new Date().toISOString().slice(0, -14),
      }
      const respuesta = await fetch(urlServer + '/api/suscripciones/HojaRuta/Listado', {
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
        link.download = 'HojaDeRuta-Suscripcion-' + dataBody.fecha + '.pdf'
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
    
    setLinks = this.props.setLinks

    clearFilter = () => {
      const fecha = document.getElementById('fecha') ? document.getElementById('fecha') : null
      fecha.value = fecha ? '' : null
      this.setState({
        fecha: null
      })
    }

    componentDidMount() {
      this.reqHojaRuta()
    }

    componentWillUnmount() {
      this.props.hideMenu(true)
    }

    render(){
      const { rows, fechaFiltrada, loading } = this.state
      
      return ( <div id="hojaRuta" className="backapp container text-left">
                <Title 
                  title='Hoja de Ruta'
                />
                <div className="fecha-hoja-ruta">
                  {fechaFiltrada.replace(/\//g, ".")}
                </div>
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
                <div className="printers">
                  <div className="d-flex" onClick={() => this.imprimirHojaRuta()}>
                    <div className="printer">
                      <span>
                        
                      </span>
                    </div>
                    <div className="printer-text">
                      <span>
                        Hoja de ruta
                      </span>
                    </div>
                  </div>
                </div>
                {loading ? 
                <Spinner style={{fontSize: '8px'}} />
                :
                <div className="cards" >
                  {rows.length > 0 ? 
                  rows.map((card, index) => {
                    return card.suscriptores.map((suscriptor, index) => {
                      return(
                        <div key={index} className="box" style={{color: "#8E95A5"}} >
                          <div className="d-flex justify-content-between" style={{marginBottom: '20px'}} >
                            <div className="f-16" style={{color: '#EA3F3F', fontFamily: 'Roboto', fontWeight: 'bold'}} >
                              {suscriptor.suscriptor}
                            </div>
                          </div>
                          <div className="d-flex" >
                            <div className="w-50 f-10">
                              PUB
                              <span className="ml-1 f-12" style={{color: '#343435'}} >
                                {card.ProductoDescripcion}
                              </span>
                            </div>
                            <div className="w-50 f-10">
                              Dir
                              <span className="ml-1 f-12" style={{color: '#343435'}} >
                                {suscriptor.calle} {" " + suscriptor.altura} {suscriptor.piso ? " " + suscriptor.piso + "º" : ""} {suscriptor.depto ? " " + suscriptor.depto : ""}
                              </span>
                            </div>
                          </div>
                        </div>)
                    })

                  }) 
                  : <div className="not-found" >
                    No se encontraron resultados para la fecha {this.state.fechaFiltrada}
                  </div>}
                </div>
                }
              </div>
        )
    }
}