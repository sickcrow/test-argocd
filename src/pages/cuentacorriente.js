import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import eraser from '../assets/eraser.svg'
import negArrow from '../assets/NegArrow.svg'
import posArrow from '../assets/PosArrow.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'
import ReactGA from 'react-ga';

const NumFormatter = ( string ) => {
  let neg = parseFloat(string) < 0
  let str = parseFloat(string) < 0 ? parseFloat(string) * -1 : parseFloat(string)
  let splitString = parseFloat(str).toFixed(2).split(""); 
  const floatNumbers = [","].concat(splitString.slice(splitString.indexOf('.') + 1, splitString.length))
  let reverseArray = splitString.reverse();
  let wocomma = reverseArray.slice(reverseArray.indexOf('.') + 1, reverseArray.length)
  let i = 0
  while(wocomma.length >= i+((i+1)*3+1)) {
    wocomma.splice((i+1)*4-1, 0, '.')
    i++
  }
  let joinArray = wocomma.reverse().concat(floatNumbers);
  
  if(neg) { joinArray.splice(0,0,"-") }

  return joinArray.join("")
};

const DateFormatter = ( value ) => {if(value) { return value.replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/, '$3.$2.$1 $4:$5:$6').slice(0, -9)} else { return "" } };

export default class CuentaCorriente extends React.Component {
    constructor(props){
      super(props);
      this.state={
        render:[],
        results: [],
        accordion: false,
        saldo: 0,
        loading: false,
        busqueda: "",
        initCuentaCorriente: {
          "fechaDesde": new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString(),
          "fechaHasta": new Date(new Date().setDate(new Date().getDate()+1)).toISOString(),
          "PageSize": 999999999
        },
        postCuentaCorriente: {
          "fechaDesde": new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString(),
          "fechaHasta": new Date(new Date().setDate(new Date().getDate()+1)).toISOString(),
          "PageSize": 999999999
        },
        movimientos: [],
      }
    }

    cuentacorriente = async () => {
      const response = await this.filtrarCC(this.state.postCuentaCorriente)
      this.setState({
        saldo: (response.rows === undefined ? 0: response.rows[0].saldo)
        //saldo: response.rows[0] === undefined ? 0 : response.rows[0].saldo
      })
    }
  
    filtrarCC = async (data) => {

      ReactGA.event({
        category: 'CuentaCorriente',
        action: 'Listar Movimientos'
      });

      this.setState({
        loading: true
      })
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const respuesta = await fetch(urlServer + '/api/cuentaCorriente/Buscar', {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
        headers
      }).then(response => response.text())
      .catch(error => {console.log('error', error); 
      this.setState({
        loading: true
      })})
      .then(result => {
        const res = JSON.parse(result)
        this.setState({
          movimientos: res.rows,
          loading: false,
        })
        return res
      })
      .catch(error => {console.log('error', error); 
      this.setState({
        loading: true
      })})
      return respuesta
    }

    clearFilter = () => {
      const fechaDesde = document.getElementById('fecha-desde') ? document.getElementById('fecha-desde') : null
      const fechaHasta = document.getElementById('fecha-hasta') ? document.getElementById('fecha-hasta') : null
      fechaDesde.value = fechaDesde ? "" : null
      fechaHasta.value = fechaHasta ? "" : null
      this.setState({
        postCuentaCorriente: {
          ...this.state.postCuentaCorriente,
          fechaDesde: this.state.initCuentaCorriente.fechaDesde,
          fechaHasta: this.state.initCuentaCorriente.fechaHasta
        }
      })
    }

    imprimirPDF = async (id) => {

      ReactGA.event({
        category: 'CuentaCorriente',
        action: 'Exportar Resumen'
      });

      document.getElementById('open-modal').click()
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + localStorage.token,
      }
      const data = {
        comprobanteIds: id.toString()
      }

      const respuesta = await fetch(urlServer + '/api/cuentaCorriente/Imprimir', {
        method: 'POST',
        redirect: 'manual',
        body: JSON.stringify(data),
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
        link.download = "Comprobante_" + id.toString() + ".pdf"
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
      document.title = "Cuenta Corriente"
      this.cuentacorriente()
    }

    componentWillUnmount(){
      this.props.hideMenu(true)
    }

    render(){
        const { saldo, movimientos, postCuentaCorriente, loading } = this.state
        return (<div id='cuentaCorriente' className="container text-left">
                  <Title 
                    classes=""
                    title='Cuenta Corriente'
                    accordion={this.state.accordion}
                    alterAccordion={() => {this.setState({accordion: !this.state.accordion})}}
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
                            postCuentaCorriente: {
                              ...this.state.postCuentaCorriente, 
                              fechaDesde: e.target.value,
                              fechaHasta: fechaHasta.value? (e.target.value > fechaHasta.value ? e.target.value : fechaHasta.value) : new Date().toISOString().slice(0,10)
                            }
                          })
                          fechaHasta.value = fechaHasta.value? (e.target.value > fechaHasta.value ? e.target.value : fechaHasta.value) : new Date().toISOString().slice(0,10)
                          }} />
                        </div>
                      </div>
                      <div style={{width: '33%'}} >
                        <div style={{marginBottom: '12px'}} >
                          Hasta
                        </div>
                        <div>
                          <input id="fecha-hasta"  className="form-control filter-input" type="date" onChange={e => this.setState({postCuentaCorriente: { ...postCuentaCorriente, fechaHasta: e.target.value} })} />
                        </div>
                      </div>
                      <div style={{width: '24%'}} >
                        <div className="eraser" onClick={() => this.clearFilter()}>
                          LIMPIAR
                          <ReactSVG src={eraser} style={{width: '16px'}} />
                        </div>
                        <div style={{width: '100%' }} className="btn button-theme " onClick={() => this.filtrarCC(postCuentaCorriente)}> Filtrar </div>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className={"text-center saldo" + (saldo < 0 ? ' positivo' : ' negativo')} >
                      <div style={{ fontSize: '12px', fontWeight: '700'}} >SALDO ACTUAL</div>
                      <div style={{ fontSize: '30px', fontWeight: '300'}} > {saldo < 0 ? '-' : ''}${saldo < 0 ? NumFormatter(saldo * -1) : NumFormatter(saldo)} </div>
                    </div>
                  </div>
                  <div className="w-100 ">
                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={e => this.setState({busqueda: e.target.value})}/>
                  </div>
                  {loading ? 
                  <Spinner style={{fontSize: '8px'}} />
                  :
                  <div className="cards">
                    {movimientos ?
                    movimientos.filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((mov, index) => {
                      return(
                        <div key={index} className="box" style={{color: "#8E95A5"}} >
                          <div className="d-flex justify-content-between" style={{marginBottom: '20px'}} >
                            <div style={{color: '#EA3F3F', fontFamily: 'Roboto', fontWeight: '300', fontSize: '20px'}} >
                            {mov.haber >= mov.debe ? 
                            <div className="d-flex" style={{color: '#2A875D'}} >
                              <ReactSVG src={posArrow} style={{width: '23px', height: '23px', marginRight: '5px', marginTop: '-1px'}} /> ${ mov.haber ? NumFormatter(mov.haber) : "" }
                            </div>  
                            :
                            <div className="d-flex" style={{color: '#EA3F3F'}}>
                              <ReactSVG src={negArrow} style={{width: '23px', height: '23px', marginRight: '5px', marginTop: '-1px'}} /> ${ mov.debe? NumFormatter(mov.debe) : "" }
                            </div>  
                            }
                            
                            </div>
                            <div style={{fontSize: '13px', marginTop: '8px'}} >
                              {DateFormatter(mov.fecha)}
                            </div>
                          </div>
                          <div className="d-flex" >
                            <div className="w-50 ccdesc" >
                              NUM:
                              <span className="ml-1 ccvalor">
                                {mov.numero}
                              </span>
                            </div>
                            <div className="w-50 ccdesc" >
                              MOV:
                              <span className="ml-1 ccvalor">
                                {mov.movimiento}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between mt-2" >
                            <div className="w-50 d-flex align-items-center ccdesc" >
                              SALDO:
                              <span className="ml-1 ccvalor">
                                {NumFormatter(mov.saldo)}
                              </span>
                            </div>
                            {mov.movimiento.trim() === "RESUMEN DE CUENTA" ?
                            <div className="descargarcc" onClick={() => this.imprimirPDF(mov.comprobanteId)} >
                              DETALLE
                              <span className="ml-1" style={{fontSize: '12px', color: '#8E95A5', fontFamily: 'FontAwesome'}} >
                              
                              </span>
                            </div> : null
                            }
                          </div>
                        </div>)
                    })
                  : null}
                  </div>
                }
              </div>)
    }

}