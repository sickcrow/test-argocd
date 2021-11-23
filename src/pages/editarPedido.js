import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import restar from '../assets/restar.svg'
import backArrow from '../assets/backArrow.svg'
import sumar from '../assets/sumar.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal)

export default class EditarPedido extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            pedido: props.props.location.state ? props.props.location.state.pedido : {},
            loading: false,
            busqueda: '',
            rows: [],
            flag: true,
            seleccionadasFlag: false,
        }
    }

    componentDidMount() {
        ReactGA.event({
            category: 'Pedidos',
            action: 'Modificar Pedido'
          });
    }

    modificarPedido = async () => {

        ReactGA.event({
            category: 'Pedidos',
            action: 'Guardar Pedido Modificado'
          });

        const url = urlServer + '/api/pedidopasadofuturo/modificar'
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const data = {
            pedidoId: this.state.pedido.pedidoId,
            tipoPedidoId: this.state.pedido.tipoPedidoId,
            cantidad: this.state.pedido.cantidadPedida,
        }

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        })
        .then(response => response.json())
        .then(result => {
            MySwal.fire({
                icon: 'success',
                title: result.message,
                showConfirmButton: false,
                timer: 1500
            })
            this.props.props.history.push("/Pedidos/MisPedidos")
        })
        .catch(error => {
            MySwal.fire({
                icon: 'error',
                title: 'Ha ocurrido un error.',
                showConfirmButton: false,
                timer: 1500
            })
            console.log('error', error)
        });
        return respuesta
    }

    render() {
        const { loading, pedido } = this.state
        if(!this.props.props.location.state) {
            return <Redirect to="/Pedidos"/>
        }

        return (<React.Fragment>
                    <div className="position-fixed back-arrow-box" onClick={() => {this.props.props.history.goBack()}}>
                        <ReactSVG src={backArrow} />
                    </div>
                    <div id='editarpedido' className="container text-left">
                        <div className="d-flex justify-content-between">
                            <Title 
                                classes=""
                                title={"Editar Pedido"}
                            />
                        </div>
                        <div className="titulo-producto">
                            {pedido.descripcion}
                        </div>
                        {loading ? 
                        <Spinner style={{fontSize: '8px'}} />
                        :
                        (<React.Fragment>
                            <div className="d-flex justify-content-between align-items-center days" >
                                <div className="f-13-5 fw-300" style={{color: '#343435', maxWidth: '66%'}}>
                                    {pedido.edicion}
                                </div>
                                <div className="d-flex justify-content-between align-items-center" style={{width: '88px'}}>
                                    <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: !pedido.cantidadPedida ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                        if (pedido.cantidadPedida > 0) {
                                            pedido.cantidadPedida--
                                            this.setState({
                                                pedido
                                            })
                                        }
                                    }}>
                                        <ReactSVG src={restar} style={{color: !pedido.cantidadPedida? '#EAEAEA': '#8E95A5', width: '11px'}} />
                                    </div>
                                    <div className="f-13-5">
                                        {pedido.cantidadPedida} 
                                    </div>
                                    <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                        pedido.cantidadPedida++
                                        this.setState({
                                            pedido
                                        })
                                    }}>
                                        <ReactSVG src={sumar} style={{width: '11px', height: '18px', color: '#8E95A5'}} />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center align-items-center" style={{position: "fixed",bottom: "56px", left: "0", right: "0", background: "white", height: "60px"}}>
                                <div className="d-flex justify-content-center align-items-center" onClick={() => this.modificarPedido()} style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "90px", height: "33px"}}>
                                    Modificar
                                </div>
                            </div>
                        </React.Fragment>
                        )}
                    </div>
                </React.Fragment>
                )
    }
}