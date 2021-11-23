import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import restar from '../assets/restar.svg'
import sumar from '../assets/sumar.svg'
import pedidos from '../assets/pedidos.svg'
import backArrow from '../assets/backArrow.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'   
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { createBrowserHistory } from 'history'
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal)

export default class CargarPedido extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            producto: this.props.props.location.state ? (this.props.props.location.state.producto.ediciones ? {
                ...this.props.props.location.state.producto,
                publicacionTipoId: 1,
            } : this.props.props.location.state.producto) : null,
            loading: false,
            busqueda: '',
            stock:[],
            redirect: false,
            flag: true,
            backendrows: this.props.props.location.state && this.props.props.location.state.producto.ediciones ? this.props.props.location.state.producto.ediciones.map(edicion => {
                    if (!edicion.cantidad && edicion.cantidad !== 0) {
                        edicion.cantidad = 0
                    }
                    return edicion
            }) : [],
            pedido: [],
            successCC: false,
            seleccionadasFlag: false,
            diasSemana: [
                {
                    dia: 'Lunes',
                    DiaSemana: 2,
                    cantidad: 0,
                },
                {
                    dia: 'Martes',
                    DiaSemana: 3,
                    cantidad: 0,
                },
                {
                    dia: 'Miércoles',
                    DiaSemana: 4,
                    cantidad: 0,
                },
                {
                    dia: 'Jueves',
                    DiaSemana: 5,
                    cantidad: 0,
                },
                {
                    dia: 'Viernes',
                    DiaSemana: 6,
                    cantidad: 0,
                },
                {
                    dia: 'Sábado',
                    DiaSemana: 7,
                    cantidad: 0,
                },
                {
                    dia: 'Domingo',
                    DiaSemana: 1,
                    cantidad: 0,
                },
            ],
            ultimasrows: [],
            siguientesrows: []
        }
    }

    history = createBrowserHistory()

    componentDidMount() {
        if(!this.state.backendrows || this.state.backendrows.length < 1) {
            this.ediciones();
        }
        document.title = "Cargar Pedido";
    }

    
    ediciones = async () => {

        ReactGA.event({
            category: 'Pedidos/CargarPedido',
            action: 'Listar Ediciones'
          });

        this.setState({
            loading: true
        })
        if(this.state.producto) {
            const headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                Authorization: 'Bearer ' + localStorage.token,
            }
            const data = {
                productoId: this.state.producto.productoId,
                fechaHasta: new Date(new Date().setDate(new Date().getDate()-1)).toISOString(),
                columnaParaOrdenar: "EDICIONFECHA DESC",
            }
            const url = urlServer + "/api/edicion/buscarediciones/crearpedido"

            const respuesta = await fetch(url, {
                method: 'POST',
                redirect: 'manual',
                body: JSON.stringify(data),
                headers
            })
            .then(response => response.json())
            .then(async result => {
                let res = result
                if(res.filter(e => !e.edicionId).length === 0) {
                    const siguiente = {
                        edicionId: null,
                        descripcion: "Siguiente Edición",
                        cantidad: 0
                    }
                    res = [
                        siguiente,
                        ...res,
                    ]
                } else {
                    const ednull = res.filter(e => !e.edicionId).filter(e => e.descripcion.toLowerCase().indexOf('siguiente') !== -1)[0]
                    let ediciones = res.filter(e=> e.edicionId)
                    result = [
                        ednull,
                        ...ediciones,
                    ]
                }
                const data = res.map(edicion => {
                    if (!edicion.cantidad && edicion.cantidad !== 0) {
                        edicion.cantidad = 0
                    }
                    return edicion
                })
                this.setState({
                    backendrows: data,
                    // rows: res,
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
        this.setState({
            loading: false
        })
    }

    enviarPedido = () => {
    
        ReactGA.event({
            category: 'Pedidos/CargarPedido',
            action: 'Enviar Pedido'
            });

        const url = urlServer + '/api/pedidopasadofuturo/guardar'
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        if (this.state.producto.publicacionTipoId !== 2) { // NO DIARIO
            //let error = false
            this.state.backendrows.filter(e => e.cantidad > 0).map(async (edicion) => {
                const data = {
                    productoId: this.state.producto.productoId,
                    edicionId: edicion.edicionId,
                    puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
                    usuarioId: JSON.parse(localStorage.infoToken).usuario_id,
                    cantidad: edicion.cantidad,
                    nombreTienda: null,
                }
                const respuesta = await fetch(url, {
                    method: 'POST',
                    redirect: 'manual',
                    body: JSON.stringify(data),
                    headers
                })
                .then(response => {
                    if (parseInt(response.status) !== 200) {throw response }

                    if(parseInt(response.status) === 200) {
                        return response.json()
                    } 
                })
                .then(result => {
               
                    MySwal.fire({
                        icon: 'success',
                        title: 'Pedido realizado con éxito!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    
                    this.setState({
                        redirect: true
                    })

                })
                .catch( err => {
                    if (typeof err.text === 'function') {
                      err.text().then(errorMessage => {
                         var msj=JSON.parse(errorMessage)
                         debugger
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
                }) 
                return respuesta
            })
        } else {
            let error = false
            this.state.diasSemana.filter(e => e.cantidad > 0).map(async (dia) => {
                const data = {
                    productoId: this.state.producto.productoId,
                    puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
                    usuarioId: JSON.parse(localStorage.infoToken).usuario_id,
                    cantidad: dia.cantidad,
                    diaSemana: dia.DiaSemana,
                }

                const respuesta = await fetch(url, {
                    method: 'POST',
                    redirect: 'manual',
                    body: JSON.stringify(data),
                    headers
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                })
                .catch(error => {
                    console.log('error', error)
                    error = true
                });
                return respuesta
            })
            if (!error) {
                MySwal.fire({
                    icon: 'success',
                    title: 'Pedido realizado con éxito!',
                    showConfirmButton: false,
                    timer: 1500
                })
                this.setState({
                    redirect: true
                })
            } else {
                MySwal.fire({
                    icon: 'error',
                    title: 'Ha ocurrido un error.',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        }
    }

    goBack = ()=>{
        this.setState({
            redirect: true,
        })
    }

    redireccionar =()=>{
        if(this.state.redirect){
            if(this.state.successCC){
                return <Redirect push to={{
                    pathname: "/Tienda/MisPedidos"
                }} />
            }
            return <Redirect push to={{
                pathname: "/Pedidos"
            }} />
        }
    }

    render() {

        const { loading, producto, diasSemana, seleccionadasFlag, backendrows } = this.state
        
        if(!this.props.props.location.state) {
            return <Redirect to="/Pedidos/MisPedidos"/>
        }

        return (<React.Fragment> 
                    
                    <div id="backarrow" className="position-fixed back-arrow-box" onClick={this.goBack}>
                        <ReactSVG src={backArrow} />
                    </div>

                    <div id='cargarpedido' className="container text-left">
                        
                        <div className="d-flex justify-content-between">
                            <Title classes=""title={seleccionadasFlag ? 'Ediciones seleccionadas' : "Cargar Pedido"}/>
                            <div className="position-relative" style={{marginTop: '53px'}} onClick={() => {
                                if(this.state.backendrows.filter(e => e.cantidad > 0).length > 0 || this.state.diasSemana.filter(e => e.cantidad > 0).length > 0) {
                                    this.setState({
                                        seleccionadasFlag: !this.state.seleccionadasFlag
                                       
                                    })
                                    this.props.hideMenu(true)
                                    
                                    ReactGA.event({
                                        category: 'Pedidos/CargarPedido',
                                        action: 'Ver Carrito'
                                        });
                                    
                                }
                            }} >
                                <ReactSVG src={pedidos} style={{width: '27px', height: '27px', color: '#8E95A5'}} />
                                <div className="position-absolute d-flex justify-content-center align-items-center f-11" style={{right: '-8px', top: '-8px', background: '#EA3F3F', color: 'white', borderRadius: '50%', width: '16px', height: '16px'}}>
                                    {this.state.producto.publicacionTipoId !== 2 ? this.state.backendrows.filter(e => e.cantidad > 0).length : this.state.diasSemana.filter(e => e.cantidad > 0).length}
                                </div>
                            </div>
                        </div>
                        <div className="titulo-producto">
                            {producto.descripcion}
                        </div>
                        {this.redireccionar()}
                        {loading ? 
                        <Spinner style={{fontSize: '8px'}} />
                        :
                        (<React.Fragment>
                            {seleccionadasFlag ? 
                                <div style={{paddingBottom: '95px'}}>
                                                                       
                                    {this.state.producto.publicacionTipoId !== 2 ? (this.state.backendrows.filter(e => e.cantidad > 0).map((edicion, index) => {
                                        return  <div key={index} className="d-flex justify-content-between  days align-items-center"  >
                                                <div className="f-13-5 fw-400" style={{color: '#343435', maxWidth: '66%'}}>
                                                    { edicion.descripcion }
                                                    
                                                </div>
                                                
                                                <div className="d-flex justify-content-between align-items-center" style={{width: '88px'}}>
                                                    <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                        if (edicion.cantidad > 0) {
                                                            edicion.cantidad--
                                                            let { backendrows } = this.state
                                                            
                                                            let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                            backendrows[ind] = edicion

                                                            this.setState({
                                                                backendrows
                                                            })
                                                        }
                                                    }}>
                                                        <ReactSVG src={restar} style={{color: !edicion.cantidad? '#EAEAEA': '#8E95A5', width: '11px'}} />
                                                    </div>
                                                    <div className="f-13-5">
                                                        {edicion.cantidad} 
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-center" style={{background: '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer'}} onClick={() => {
                                                        if (edicion.stockDisponibleAlmacen > 0) {
                                                            edicion.cantidad++
                                                            let { backendrows } = this.state
                                                            let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                            backendrows[ind] = edicion

                                                            this.setState({
                                                                backendrows
                                                            })
                                                            
                                                        }
                                                    }}>
                                                        <ReactSVG src={sumar} style={{color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA': '#8E95A5', width: '11px', height: '18px'}} />
                                                    </div>
                                                </div>
                                            </div>
                                            })): 
                                            (this.state.diasSemana.filter(e => e.cantidad > 0).map((dia, index) => {
                                            return  <div key={index} className="d-flex justify-content-between align-items-center days" >
                                                        <div className="f-13-5 fw-400" style={{color: '#343435', maxWidth: '66%'}}>
                                                            {dia.dia}
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center" style={{width: '88px'}}>
                                                            <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: !dia.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                                if (dia.cantidad > 0) {
                                                                    dia.cantidad--
                                                                    let { diasSemana } = this.state
                                                                    let ind = diasSemana.findIndex(e => e.DiaSemana === dia.DiaSemana)
                                                                    diasSemana[ind] = dia
                                                                    this.setState({
                                                                        diasSemana
                                                                    })
                                                                }
                                                            }}>
                                                                <ReactSVG src={restar} style={{color: !dia.cantidad? '#EAEAEA': '#8E95A5', width: '11px'}} />
                                                            </div>
                                                            <div className="f-13-5">
                                                                {dia.cantidad} 
                                                            </div>
                                                            <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                                dia.cantidad++
                                                                let { diasSemana } = this.state
                                                                let ind = diasSemana.findIndex(e => e.DiaSemana === dia.DiaSemana)
                                                                diasSemana[ind] = dia
                                                                this.setState({
                                                                    diasSemana
                                                                })
                                                            }}>
                                                                <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: '#8E95A5'}} />
                                                            </div>
                                                        </div>
                                                    </div>
                                            }))}

                                            
                                </div>
                            : (this.state.producto.publicacionTipoId !== 2 ? 
                                    <div className="pedido" style={{paddingBottom: '95px'}}>

                                        {/* Pestañas pedidos */}
                                        {this.state.producto.publicacionTieneRelanzamiento ? <div className="tabs d-flex justify-content-between w-100 " style={{borderBottom: '1px solid gray', marginBottom: '18px'}}>
                                                <div className={"tablinks col-6 text-center" + (this.state.flag ? ' active' : '')} onClick={(e) => {this.setState({flag: true})}}>Últimas Ediciones</div>
                                                <div className={"tablinks col-6 text-center" + (!this.state.flag ? ' active' : '')} onClick={(e) => {this.setState({flag: false})}}>Siguientes Ediciones</div>
                                            </div> : null 
                                        }
                                        
                                        <div> 
                                            
                                            {/* Campo de busqueda para pedidos */}
                                            <div className="w-100" style={{marginBottom: '18px'}}>
                                                <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={(e) => { this.setState({ busqueda: e.target.value }) }} value={this.state.busqueda}/>
                                            </div>


                                        {/* Pedidos ultimas ediciones */}
                                        {backendrows.filter(e => (this.state.flag ? (e.edicionId > 0) : (typeof (e.edicionId) !== "number"))).filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((edicion, index) => {
                                            
                                            return <div key={index} className="d-flex justify-content-between align-items-center days" >
                                                <div className="f-13-5 fw-400" style={{ color: '#343435', maxWidth: '66%' }}>
                                                    {edicion.descripcion + (edicion.descripcion.indexOf(edicion.edicionNumeroFecha) !== -1 ? "" : (" " + (edicion.edicionNumeroFecha ? edicion.edicionNumeroFecha : "")))}
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center" style={{ width: '88px' }}>
                                                    <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                        if (edicion.cantidad > 0) {
                                                            edicion.cantidad--
                                                            let { backendrows } = this.state
                                                            let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                            backendrows[ind] = edicion
                                                            this.setState({
                                                                backendrows
                                                            })
                                                        }
                                                    }}>
                                                        <ReactSVG src={restar} style={{ color: !edicion.cantidad ? '#EAEAEA' : '#8E95A5', width: '11px' }} />
                                                    </div>
                                                    <div className="f-13-5">
                                                        {edicion.cantidad}
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                        edicion.cantidad++
                                                        let { backendrows } = this.state
                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                        backendrows[ind] = edicion
                                                        this.setState({
                                                            backendrows
                                                        })
                                                    }}>
                                                        <ReactSVG src={sumar} style={{ width: '11px', height: '18px', color: '#8E95A5' }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        })}

                                    </div>
                                </div>:
                            <div className="pedido" style={{paddingBottom: '95px'}}>
                                <div className="f-16 fw-400 text-center" style={{marginBottom: '30px'}}>
                                    Pedido futuro
                                </div>
                                <div>
                                    {diasSemana.map((dia, index) => {
                                        return  <div key={index} className="d-flex justify-content-between align-items-center days" >
                                                    <div className="f-13-5 fw-400" style={{color: '#343435', maxWidth: '66%'  }}>
                                                        {dia.dia}
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center" style={{width: '88px'}}>
                                                        <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: dia.cantidad === 0 ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                            if (dia.cantidad > 0) {
                                                                let { diasSemana } = this.state
                                                                diasSemana[index].cantidad--
                                                                this.setState({
                                                                    diasSemana
                                                                })
                                                            }
                                                        }}>
                                                            <ReactSVG src={restar} style={{color: dia.cantidad === 0 ? '#EAEAEA': '#8E95A5', width: '11px'}} />
                                                        </div>
                                                        <div className="f-13-5">
                                                            {dia.cantidad} 
                                                        </div>
                                                        <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                            let { diasSemana } = this.state
                                                            diasSemana[index].cantidad++
                                                            this.setState({
                                                                diasSemana
                                                            })
                                                        }}>
                                                            <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: '#8E95A5'}} />
                                                        </div>
                                                    </div>
                                                </div>
                                    })}
                                </div>
                            </div>)}
                            
                            {this.state.producto.publicacionTipoId !== 2 ? (this.state.backendrows.filter(e => e.cantidad > 0).length !== 0 ? 
                            <div>

                                <div id="boton-enviar" className="d-flex justify-content-center align-items-center barra-enviar">
                                    
                                    <div className="d-flex justify-content-center align-items-center" onClick={() => {
                                        this.props.hideMenu(true)

                                        Swal.fire({
                                            title: '¿Desea realizar este pedido?',
                                            text: "Está a punto de realizar un pedido sin devolución.",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            cancelButtonText: 'Cancelar',
                                            confirmButtonText: 'Confirmar Pedido'
                                            }).then((result) => {
                                            if (result.value) {
                                                this.enviarPedido()
                                            }
                                        })
                                        
                                    }
                                    
                                    } style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "105px", height: "33px"}}>Confirmar Pedido</div>
                                </div>
                            </div>
                            : null) : (this.state.diasSemana.filter(e => e.cantidad > 0).length !== 0 ? 
                            <div id="boton-enviar" className="d-flex justify-content-center align-items-center barra-enviar">
                                <div className="d-flex justify-content-center align-items-center" onClick={() => {
                                    Swal.fire({
                                        title: '¿Desea realizar este pedido?',
                                        text: "Está a punto de realizar un pedido sin devolución.",
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#3085d6',
                                        cancelButtonColor: '#d33',                                        
                                        cancelButtonText: 'Cancelar',
                                        confirmButtonText: 'Confirmar Pedido'
                                        }).then((result) => {
                                        if (result.value) {
                                            this.enviarPedido()
                                        }
                                    })
                                }} style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "105px", height: "33px"}}>"Confirmar Pedido"</div>
                            </div>
                            : null)}
                        </React.Fragment>
                        )}
                    </div>
                </React.Fragment>
                )
    }
}