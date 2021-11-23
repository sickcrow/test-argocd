import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { Title } from '../components/title'
import Spinner from '../components/spinner';
import urlServer from '../server'
import Scanner from '../components/Scanner';
import ReactGA from 'react-ga';

export default class Publicaciones extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            publicaciones: [],
            busqueda: '',
            loading: false,
            producto: null,
            redirect: false,
            scanning: false,
            timeoutSearchId: 0,
            AgregarPedidoOpen: false,
            isTienda: this.props.props.location.pathname.includes("Tienda")
        }
    }

    timeoutSearch = (string) => {
        if(this.state.timeoutSearchId) {
            clearInterval(this.state.timeoutSearchId)
        }
        this.setState({
            timeoutSearchId: setTimeout(() => this.reqPublicaciones(string), 1000)
        })
    }

    reqPublicaciones = async (string) => {

        if(!this.state.isTienda)
        {
            ReactGA.event({
                category: 'Pedidos',
                action: 'Listar Publicaciones'
              });
        }

        this.setState({
            loading: true
        })
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
                this.setState({
                    publicaciones: result,
                    loading: false
                })
            })
            .catch(error => {
                console.log('error', error)
                this.setState({
                    loading: false
                })
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
                this.setState({
                    publicaciones: result,
                    loading: false
                })
            })
            .catch(error => {
                console.log('error', error)
                this.setState({
                    loading: false
                })
            });
            return respuesta
        }
    }

    setEdiciones = (result) => {
      this.setState({
        loading: true
      })
      if (result.length !== 0) {
        result = result.map(edicion => {
          edicion.cantidad = 0
          return edicion
        })
        this.setState({
          ediciones: result,
        })
      }
      this.setState({
        loading: false
      })
      return result
    }

    closeModal = () => {
        if(this._isMounted) {
            this.setState({
              scanning: false
            })
        } 
    }

    publicaciones = () => {
        if(this.state.isTienda){
            return <Redirect push to={{
                pathname: '/Tienda/CargarPedido',
                state: {
                    producto: {"CC":true}
                }
            }} />
        }
        if(this.state.AgregarPedidoOpen) {
            return <Redirect push to={{
                pathname: '/Pedidos/CargarPedido',
                state: {
                producto: this.state.producto,
            }
            }} />
        }
    }

    onDetectedCode = async (ean) => {
        if(this._isMounted) {
            await this.setState({
                ean
            })
            const data = await this.ediciones(ean)

            if(data.length === 1) {
                await this.setState({producto: data[0]});
                this.setState({AgregarPedidoOpen: true})
            } else {
                this.setState({
                    publicaciones: data
                })
            }
        }
    }

    ediciones = async (ean) => {
        this.setState({
            loading: true
        })
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const data = {
            ean: ean,
            columnaParaOrdenar: "DESCRIPCION DESC",
            puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
        }

        const url = urlServer + "/api/producto/ean/listar"

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        })
        .then(response => response.json())
        .then(result => {
            let res = result
            console.log(res)
           
            this.setState({
                loading: false
            })
            return res
        })
        .catch(error => {
            console.log('error', error)
            this.setState({
                loading: false
            })
        });
        return respuesta
    }

    componentDidMount() {
        this._isMounted = true
        document.title = "Cargar Pedidos"
        if(!this.state.isTienda)
            this.reqPublicaciones('')
    }

    componentWillUnmount() {
        this._isMounted = false
        this.setState({
            scanning: false,
        })
    }

    render() {
        const { loading, publicaciones,redirect } = this.state
        return (
                <React.Fragment>
                    <div id='Publicaciones' className="container text-left">
                        <Title
                            classes=""
                            title='Cargar Pedidos'
                        />
                        {this.state.scanning ? <Scanner onDetectedCode={this.onDetectedCode} closeModal={this.closeModal} setEdiciones={this.setEdiciones} /> : null}
                        <div className="mb-3">
                            Filtro por código de barras 
                            <div id="botonvisible" className="btn button-theme ml-3" onClick={async () => {
                            
                            ReactGA.event({
                                category: 'Pedidos',
                                action: 'Escanear Codigo de Barra'
                                });

                            await this.setState({
                                scanning: true
                            })
                            const button = document.getElementById('botonbarras')
                            button.click()
                            }}>
                            Escanear
                            </div>
                            <button id="botonbarras" type="button" className="btn btn-primary d-none" data-toggle="modal"  data-target="#codigodebarras">
                            Escanear
                            </button>
                        </div>
                        {redirect ? <Redirect push to={{
                            pathname: '/Pedidos'
                        }} /> : null}
                        <div className="w-100 ">
                            <input className="w-100 form-control" type="text" placeholder="Publicación" onChange={e => {
                                this.setState({busqueda: e.target.value})
                                this.timeoutSearch(e.target.value)
                                }}/>
                        </div>
                        <div className="text-center f-16 fw-400" style={{marginTop: '22px'}}>
                            Elija una publicación para cargar un pedido
                        </div>
                        {this.publicaciones()}
                        {loading ? 
                        <Spinner style={{fontSize: '8px'}} />
                        :
                        <div className="cards" >
                        {publicaciones.length > 0 ? publicaciones.map((card, index) => {
                            
                            return  <div key={index} className="publicard d-flex justify-content-center align-items-center" onClick={async () => {await this.setState({producto: card}); this.setState({AgregarPedidoOpen: true})}}>
                                        <div className="d-flex justify-content-center align-items-center text-center" style={{color: 'white'}}>
                                            {card.descripcion}
                                        </div>
                                    </div>
                        }) 
                        : null }
                        </div>}
                    </div>
                </React.Fragment>
                )
    }
}