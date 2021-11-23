import * as React from 'react';
import { Redirect } from 'react-router-dom'
import { ReactSVG } from 'react-svg';
import { Title } from '../components/title'
import restar from '../assets/restar.svg'
import sumar from '../assets/sumar.svg'
import pedidos from '../assets/pedidos.svg'
import backArrow from '../assets/backArrow.svg'
import tienda from '../assets/ic_cc.svg'
import eliminar from '../assets/eliminar.svg'
import compartir from '../assets/compartir.svg'
import Spinner from '../components/spinner';
import urlServer from '../server'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { createBrowserHistory } from 'history'
import ReactGA from 'react-ga';
import LazyLoad from "react-lazyload";
import Carousel from 'react-bootstrap/Carousel';
import AppContext from "../context/AppContext";

const MySwal = withReactContent(Swal)

const tiendaUrl = 'https://paradaonline.com.ar/s/img/tapas'
const imagenDefault = 'IC_CC.png'

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
            busquedaPorCategoria: '',
            busquedaPorEdicionBanner: '',
            publicationCategoria: [],
            categoriaSeleccionada: null,
            stock:[],
            redirect: false,
            flag: true,
            flagCatalogoCategoria: true,
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
            siguientesrows: [],
            categoriaId: 0,
            bannerMarketingShow: false,
            bannerSeleccionado: null,
            bannerEdicionesConfiguradas: [],
            banners: []
            
        }
    }

    static contextType = AppContext;

    history = createBrowserHistory()

    dataTienda = async () => {

        ReactGA.event({
            category: 'Tienda/CargarPedido',
            action: 'Mostrar Catalogo'
          });

        this.setState({
            loading: true
        })
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token
        }
        const data = {
            nombreTienda: "Tienda Agea"
        }

        const url = urlServer + "/api/tienda/catalogoTienda/listar" 

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual', 
            body: JSON.stringify(data),
            headers 
        })
        .then(response => response.json())
        .then(resultCatalogo => {
            
            this.setState({
                producto: resultCatalogo,
                loading: false
            })
            

            // Recuperar ediciones del carrito
            var urlCarrito = urlServer + "/api/tienda/carrito/obtener";
            var dataCarrito = {
                UsuarioId: null
            };

            fetch(urlCarrito, {
                method: 'POST',
                body: JSON.stringify(dataCarrito),
                headers: {
                    'Authorization': 'bearer ' + localStorage.token,
                    'Content-Type': 'application/json'
                }
            }).then(responseCarrito => {
                return responseCarrito.json();
            }).then(resultCarrito => {
                
                // Recorro catalogo y precargo carrito
                const dataCatalogo = resultCatalogo.map((edicion,index )=> {
                    if (!edicion.cantidad && edicion.cantidad !== 0) {
                        edicion.cantidad = 0
                    }
                    this.setState({
                        stock: [...[], edicion.stockDisponibleAlmacen]
                    })
    
                    edicion = {...edicion, excedido: 0, marcaExcedido: false};
                    
                    var indice = resultCarrito.findIndex(ed => ed.edicionId === edicion.edicionId)
                    if(indice !== -1)
                    {
                        var aux = resultCarrito[indice];
                        edicion.cantidad = aux.cantidad;
                    }

                    return edicion
                })

                this.setState({
                    backendrows: dataCatalogo,
                    loading: false
                })

                console.log(resultCarrito);
            }).catch( errorCarrito => {
                console.log("error al precargar carrito", errorCarrito);
            });
            
        })
        .catch(error => {
            console.log('error', error)
            this.setState({
                loading: false
            })
        });
        return respuesta
    }


    bannerEdicionesConfiguradas = (bannerId) => {

        ReactGA.event({
            category: 'Tienda/CargarPedido',
            action: 'Obtener Ediciones Configuradas por Banner'
            });

        const url = urlServer + '/api/tienda/catalogoTienda/listar';
        const data = {
            nombreTienda: "Tienda Agea",
            bannerId: bannerId
        }

        const respuesta = fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Authorization': 'bearer ' + localStorage.token,
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            return response.json();
        }).then((result) => {

            var ediciones = [];
            result.forEach(function(value, index, array) {
                ediciones.push(value.edicionId);
            })

            this.setState({bannerEdicionesConfiguradas: ediciones})
        }).catch((error) => {
            console.log('error al obtener ediciones configuradas ', error);
        })

        return respuesta;
    }
    
    listadoCategorias = async () => {
        const headers = {
            "Content-Type": 'application/json',
            "Accept": 'application/json',
            Authorization: 'Bearer ' + localStorage.token
        }

        const data = {
            NombreTienda: "TIENDA AGEA"
        }

        const url = urlServer + "/api/tienda/categoriapublicacion/listar";

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers: headers
        })
        .then(response => response.json())
        .then(result => {

            var categoriasSinDestacados = result.filter(x => x.descripcion !== 'DESTACADOS')
            
            var aux = result.filter(x => x.descripcion === 'DESTACADOS');
            var categoriaId = aux[0].publicacionCategoriaId;
            
            this.setState({categoriaId: categoriaId});
            this.setState({publicationCategoria: categoriasSinDestacados});

            // Cuando selecciono publicacion desde menu lateral ------------------

            let urlConParametros = this.context.urlConParametros;
            if(urlConParametros.includes("?"))
            {
                let url = new URL(urlConParametros);
                let categoria = url.searchParams.get('categoria');
                let producto = url.searchParams.get('producto');
                if(categoria === "Todos")
                {
                    this.setState({flagCatalogoCategoria: false})
                }
                else
                {
                    this.setState({flagCatalogoCategoria: true})
                    categoriasSinDestacados.map((card, index) => {
                        if(card.descripcion === categoria)
                        {
                            this.setState({categoriaSeleccionada: card});
                        }
                    }) 
                    this.setState({busqueda: producto});
                    this.setState({busquedaPorCategoria: producto});
                    this.props.hideMenu(true) 
                }
            }

        })
        .catch(error => {
            console.log('error', error)
            
        });
      return respuesta

    }

    compartir = async (edicion) => {
     fetch(`${tiendaUrl}/${edicion.codigoEditor}.png`)
      .then(function(response) {
            if(response.ok) {
                response.blob()
                    .then(blobData => {
                        var file = new File([blobData], "picture.png", {type: 'image/png'});
                        var filesArray = [file];
                        if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                            navigator.share({
                                text: `Publicacion: ${edicion.edicionDescripcionCorta} \n Precio de Venta: $${edicion.precioTapa}`,
                                files: filesArray,
                                title: 'Compartir publicacion',
                            })
                            .then(() => console.log('Successful share'))
                            .catch(error => console.log('Error sharing:', error));;
                        }
                    });
            }
        })
        .catch(function(response) {
            fetch(`${tiendaUrl}/${imagenDefault}`)
                .then(response => response.blob()) 
                .then(blobData => {
                    var file = new File([blobData], "picture.png", {type: 'image/png'});
                    var filesArray = [file];
                    if(navigator.canShare && navigator.canShare({ files: filesArray })) {
                        navigator.share({
                            text: `Publicacion: ${edicion.edicionDescripcionCorta} \n Precio de Venta: $${edicion.precioTapa}`,
                            files: filesArray,
                            title: 'Compartir publicacion',
                        })
                        .then(() => console.log('Successful share imagen default'))
                        .catch(error => console.log('Error sharing imagen default:', error));;
                    }
                })
            })
    }

    componentDidMount() {
        if(!this.state.backendrows || this.state.backendrows.length < 1) {
            this.dataTienda();
        }
        document.title = "Productos";
        this.listadoCategorias();
        this.obtenerBanners();

    }

    obtenerBanners = () => {
        var url = urlServer + '/api/banner/buscar';

        fetch(url, {
            method: 'POST',
            redirect: 'manual',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + localStorage.token
            }
        }).then( (response) => {

            if(response.status === 200)
            {
                return response.json();
            }
            else {
                throw response;
            }
        }).then( (result) => {

            var nroBanners = result.length;
            if(nroBanners > 0) {
                this.setState({banners: [...result]});
            }

        }).catch( (error) => {
            console.log('error ' + error);
        });

    }


    
    controlMontoDiario = () => {
        const url = urlServer + '/api/tienda/montoDiario'
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const data = {
            puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
            nombreTienda: "Tienda Agea"
        }
        var respuesta = fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
            })
            .then(response => response.json())
            .then(result => {
                var total =this.mostrarTotalCompraTienda();
                if(result.monto!==0 && result.disponible <  total){
                    var disponible = result.disponible;
                    if(result.disponible <= 0){
                        disponible=0;
                    }
                    //var valorExcedido = total-disponible;
                    //var valor =this.redondearPrecio(valorExcedido);
                    var msj = "No puede realizar pedidos. Por favor, comuníquese con su Distribuidora. </br> Disponible para compra: $"+disponible;
                    
                    MySwal.fire({
                        icon: 'error',
                        title: msj,
                        showConfirmButton: true,
                        confirmButtonText: 'Aceptar'
                        
                    });
                    this.setState({backendrows: this.state.backendrows});
                    this.setState({loading: false});
                }else{
                    this.verificarStockDisponible()
                }
            }).catch( (error) => {
                console.log('error al crear pedido de tienda ', error);
                this.setState({loading: false}) ;
            });
            return respuesta
    }

    enviarPedido = async() => {
        
        ReactGA.event({
            category: 'Tienda/CargarPedido',
            action: 'Enviar Pedido'
            });
        
        const url = urlServer + '/api/pedidopasadofuturo/pedidoPasado/guardar'
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        if (this.state.producto.publicacionTipoId !== 2) { // NO DIARIO
            var listadoPedido = this.state.backendrows.filter(e => e.cantidad>0).map((ed)=>{
                const data = {
                    //productoId: ed.productoId,
                    edicionId: ed.edicionId,                    
                    cantidad: ed.cantidad
                }
                return data;
            });
            const data = {
               pedidos: listadoPedido, 
               puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
               usuarioId: JSON.parse(localStorage.infoToken).usuario_id,
               nombreTienda: "Tienda Agea"
            };
            const promesa = await fetch(url, {
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
                    redirect: true,
                    successCC: true
                })
                
            })
            .catch( err => {
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
                this.setState({loading: false})
            }) 

            return promesa;
        
        } else {
            //CUANDO SE USA ESTA PARTE??
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
                    error = true;
                    this.setState({loading: false});
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
                this.setState({loading: false});
            }
        }
    }

    verificarStockDisponible = () => {

        if(!this.state.seleccionadasFlag){

            ReactGA.event({
                category: 'Tienda/CargarPedido',
                action: 'Ver Carrito'
              });

            this.setState({
                seleccionadasFlag: true
            });
            this.setState({loading: false});
            return;
        }

        var stockSuficiente = true;
        var urlStock = urlServer + '/api/tienda/edicionTiendaStockDisponible';
        var filtro = null; 
        var promesas = this.state.backendrows.filter(c => c.cantidad > 0).map((edicion, index) => {
            filtro = {
                edicionId: edicion.edicionId,
                cantidad: edicion.cantidad,
                nombreAlmacenGlobal: 'Tienda Agea'
            };

            return fetch(urlStock, {
                method: 'POST',
                body: JSON.stringify(filtro),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'bearer ' + localStorage.token
                }
            }).then(response => {
                return response.json();
            }).then(result => {

                if(result.stockResultante < 0)
                {
                    edicion.excedido = result.stockResultante;
                    edicion.marcaExcedido = true;
                    var index = this.state.backendrows.findIndex(c => c.edicionId === edicion.edicionId)
                    this.state.backendrows[index] = edicion;
                    stockSuficiente = false;
                }

            
            }).catch(error => {
                console.log('error: ' + error);
                this.setState({loading: false});
            })
        })

        Promise.all(promesas).then(() => {
            if(stockSuficiente === true)
                this.enviarPedido();
            else
            {
                MySwal.fire({
                    icon: 'error',
                    title: 'Productos con stock insuficiente. Disminuya la cantidad solicitada o saque el producto del carrito.',
                    showConfirmButton: true,
                    confirmButtonText: 'Aceptar'
                    
                });

                this.setState({backendrows: this.state.backendrows});
                this.setState({loading: false});
            }
        });
    }

    redireccionar =()=>{
        if(this.state.redirect){
            if(this.state.successCC){
                return <Redirect push to={{
                    pathname: "/Tienda/MisPedidos"
                }} />
            }
            return <Redirect push to={{
                pathname: this.state.seleccionadasFlag?"/Tienda":"/"
            }} />
        }
    }

    mostrarTotalCompraTienda = () => {
        var aux = [];
        aux = this.state.backendrows.filter(a => a.cantidad > 0).map((card, index) => {
            return {precioVenta: card.precioVenta, cantidad: card.cantidad, etiquetaDescuento: card.etiquetaDescuento, precioConDescuento:card.precioConDescuento, esInterior:card.esInterior}
        });

        var total = 0;
        var subTotal = 0;
        for(var a = 0; a < aux.length; a++)
        {
            subTotal = this.redondearPrecio( aux[a].esInterior === false && aux[a].etiquetaDescuento.length > 0 ? aux[a].precioConDescuento : aux[a].precioVenta) * aux[a].cantidad;
            total += subTotal;
        }
        return this.redondearPrecio(total);
    }

    redondearPrecio = (numero) => {
        return numero.toFixed(2);
    }

    addDefaultSrc(ev){
        ev.target.src = tienda
    }

    addDefaultBannerSrc(ev){
        ev.target.src = `${tiendaUrl}/${imagenDefault}`
    }
    // Funciones para persistir carrito de compras
    tiendaCarritoActualizar = (edicionId, cantidad) => {
        var url = urlServer + '/api/tienda/carrito/actualizar';
        var data = {
            usuarioId: null,
            edicionId: edicionId,
            cantidad: cantidad
        };

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Authorization': 'bearer ' + localStorage.token,
                'Content-Type': 'application/json' 
            }
        }).then( response => {
            return response.json();
        }).then(result => {
            console.log(result);
        }).catch(error => {
            console.log('error', error);
        });
    }

    tiendaCarritoVaciar = (esCompra, edicionId) => {
        var url = urlServer + '/api/tienda/carrito/vaciar';
        var data = {
            usuarioId: null,
            esCompra: esCompra,
            edicionId: edicionId
        };

        fetch(url, {
            method:'POST',
            body: JSON.stringify(data),
            headers: {
                'Authorization': 'bearer ' + localStorage.token,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            return response.json();
        }).then(result => {
            console.log(result);
        }).then(error => {
            console.log('error ', error);
        });
    }

    cardItem=(edicion)=>{
        return (<div className="w-100 d-flex justify-content-between" >
        <span className="subTitleItem" style={{ fontSize: '15px' }}>{edicion.edicionDescripcionCorta}</span>
        &nbsp;
        <div style={{display: "",textAlign:"right"}}>
            <em className="priceItem" style={{ display: "block", textDecoration: edicion.esInterior === false && edicion.etiquetaDescuento.length > 0?'line-through':'', maxHeight:"18px"  ,fontSize:  edicion.esInterior === false && edicion.etiquetaDescuento.length > 0?'13px ':'15px', marginLeft:'20px', height: edicion.esInterior === false && edicion.etiquetaDescuento.length > 0?'16px ':'' }}>${edicion.precioVenta.toFixed(2)}</em>
            {edicion.esInterior === false && edicion.etiquetaDescuento.length > 0 ? 
                <React.Fragment> 
                    <em className="priceItem" style={{  fontSize: '15px', marginLeft:'10px' }}>${edicion.precioConDescuento.toFixed(2)}</em>
                    <em className="priceItem" style={{ width:"102px",fontSize: '14px', marginLeft:'0px', color:"#09b909c7", position: "relative" , float: "right"  }}>{edicion.descuento}% OFF</em>
                </React.Fragment>
                :
                <div>
                    {edicion.etiquetaDescuento.length > 0 ? 
                        <React.Fragment
                        ><em className="priceItem" style={{ fontSize: '14px', marginLeft:'0px', color:"#09b909c7", position: "relative" }}>{edicion.descuento}% OFF</em>
                        <em className="priceItem" style={{ width:"102px",fontSize: '14px', marginLeft:'0px', color:"#09b909c7", position: "relative" , float: "right" }}>Costo Vendedor</em></React.Fragment>
                        :  null}
                </div>}
        </div>
    </div>)
    }

    render() {

        const { loading, producto, seleccionadasFlag, backendrows, publicationCategoria } = this.state
        
        if(!this.props.props.location.state) {
            return <Redirect to="/Tienda"/>
        }

        return (
            <React.Fragment> 
                {!this.state.seleccionadasFlag ?
                    null
                    : 
                    <div id="backarrow" className="position-fixed back-arrow-box" onClick={() => {
                                this.setState({ seleccionadasFlag: !this.state.seleccionadasFlag })
                                this.props.hideMenu(false)
                            }}>
                        <ReactSVG src={backArrow} />
                    </div>
                }

                {/* Flecha volver a categorias */}
                {this.state.categoriaSeleccionada && this.state.flagCatalogoCategoria && !this.state.seleccionadasFlag && !this.state.bannerMarketingShow ? 
                    <div id="backarrow" className="position-fixed back-arrow-box" onClick={() => {
                            this.setState({categoriaSeleccionada: null})
                            this.props.hideMenu(false)
                        }}>
                        <ReactSVG src={backArrow} />
                    </div>
                    : null 
                }

                 {/* Flecha volver de ediciones banner */}
                 {this.state.bannerMarketingShow ? 
                    <div id="backarrow" className="position-fixed back-arrow-box" onClick={() => {
                            this.setState({bannerMarketingShow: false})
                            this.props.hideMenu(false)
                            this.setState({busquedaPorEdicionBanner:''})
                        }}>
                        <ReactSVG src={backArrow} />
                    </div>
                    : null 
                }

                <div id='cargarpedido' className="tienda container text-left">
                <div className="d-flex justify-content-between">
                    <Title classes=""title={seleccionadasFlag ? "Ediciones seleccionadas" : "Productos"}/>
                    <div className="position-relative" style={{marginTop: '33px'}} onClick={() => {
                            if(this.state.backendrows.filter(e => e.cantidad > 0).length > 0 || this.state.diasSemana.filter(e => e.cantidad > 0).length > 0) {
                                this.setState({
                                    seleccionadasFlag: !this.state.seleccionadasFlag
                                    
                                })
                                this.props.hideMenu(true)
                                if(!this.state.seleccionadasFlag)
                                {
                                    ReactGA.event({
                                            category: 'Tienda/CargarPedido',
                                            action: 'Ver Carrito'
                                        });
                                }

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
                            {/* Carrito */}
                            {this.state.producto.publicacionTipoId !== 2 ? (this.state.backendrows.filter(e => e.cantidad > 0).map((edicion, index) => {
                                return  <div key={index} className="d-flex justify-content-between align-items-center days itemCarTienda mb-4">
                                            <div className="f-13-5 fw-400" style={{color: '#343435', maxWidth: '60%'}}>
                                                {edicion.edicionDescripcionCorta }
                                                &nbsp;
                                                &nbsp;
                                                <span style={{ color: '#224372', fontWeight: 'bold' }}> ${this.redondearPrecio(this.redondearPrecio(edicion.esInterior === false && edicion.etiquetaDescuento.length > 0 ? edicion.precioConDescuento : edicion.precioVenta) * edicion.cantidad)}</span>
                                                <br />
                                                {edicion.excedido < 0 ?
                                                    <span style={{fontWeight:'bold', color:'red'}}>Esta excedido en {edicion.excedido * -1} ejemplares</span>
                                                : null}
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center " style={{width: '140px'}}>
                                                <div className="d-flex justify-content-center align-items-center" style={{cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%'}} onClick={() => {
                                                    if (edicion.cantidad > 0) {
                                                        edicion.cantidad--
                                                        this.tiendaCarritoActualizar(edicion.edicionId, -1)
                                                        if(edicion.marcaExcedido === true)
                                                            edicion.excedido++;

                                                        let { backendrows } = this.state
                                                        
                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                        backendrows[ind] = edicion
                                                        
                                                        this.setState({
                                                            backendrows,
                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen++]
                                                        })
                                                    }
                                                }}>
                                                    <ReactSVG src={restar} style={{color: !edicion.cantidad? '#EAEAEA': '#8E95A5', width: '11px'}} />
                                                </div>
                                                &nbsp;
                                                &nbsp;
                                                <div className="f-13-5 fw-400" >
                                                    {edicion.cantidad} 
                                                </div>
                                                &nbsp;
                                                &nbsp;
                                                <div className="d-flex justify-content-center align-items-center" style={{background: (edicion.stockDisponibleAlmacen <= 0 ? '#FCFCFC' : '#F4F4F4'), width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer'}} onClick={() => {
                                                    if (edicion.stockDisponibleAlmacen > 0) {
                                                        edicion.cantidad++
                                                        this.tiendaCarritoActualizar(edicion.edicionId, 1)
                                                        if(edicion.marcaExcedido === true)
                                                            edicion.excedido--;

                                                        let { backendrows } = this.state
                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                        backendrows[ind] = edicion
                                                        
                                                        this.setState({
                                                            backendrows,
                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen--]
                                                        })
                                                    }
                                                }}>
                                                    <ReactSVG src={sumar} style={{color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA': '#8E95A5', width: '11px', height: '18px'}} />
                                                </div>

                                                {/* Quitar edicion del carrito */}
                                                &nbsp;
                                                &nbsp;
                                                <div className="d-flex align-items-center">
                                                    <ReactSVG src={eliminar} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} onClick={() => {
                                                        edicion.stockDisponibleAlmacen += edicion.cantidad;
                                                        edicion.cantidad = 0;
                                                        this.tiendaCarritoVaciar(0, edicion.edicionId);
                                                        var index = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                        backendrows[index] = edicion;
                                                        this.setState({
                                                            backendrows
                                                        })
                                                        
                                                    }}/>
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
                            <div className="pedido" style={{paddingBottom: '25px', marginBottom:'80px'}}> {/*padding con destacados*/}


                                {/* Campo de busqueda, para categorias y todas las publicaciones */}
                                {!this.state.bannerMarketingShow ? (
                                <div className="w-100" style={{marginBottom:'-20px'}}>
                                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={(e) => { 
                                        this.setState({ busquedaPorCategoria: e.target.value });
                                        this.setState({ busqueda: e.target.value });
                                        
                                    }} 
                                        
                                    onKeyUp={() => {
                                        if(this.state.flagCatalogoCategoria && !this.state.categoriaSeleccionada)
                                        {
                                            this.state.flagCatalogoCategoria = false;
                                            this.setState({flagCatalogoCategoria: this.state.flagCatalogoCategoria})
                                        }
                                    }}

                                    value={this.state.busqueda}/>
                                </div>
                                ):null}


                                {/* Campo de busqueda, para ediciones de banner configuradas*/}
                                {this.state.bannerMarketingShow ? (
                                <div className="w-100" style={{marginBottom:'-20px'}}>
                                    <input className="w-100 form-control" type="text" placeholder="Buscar" onChange={(e) => { 
                                        this.setState({ busquedaPorEdicionBanner: e.target.value});
                                        
                                    }} 
                                    
                                    value={this.state.busquedaPorEdicionBanner}/>
                                </div>
                                ):null}
                                
                                
                                {/* Pestañas catalogo y todas las categorias */}
                                {!this.state.bannerMarketingShow ? (
                                    <div className="tabs d-flex justify-content-between w-100 " style={{borderBottom: '1px solid gray', marginBottom: '18px'}}>
                                        <div className={"tablinks col-6 text-center" + (this.state.flagCatalogoCategoria ? ' active' : '')} onClick={(e) => {
                                            this.setState({flagCatalogoCategoria: true})
                                            if(this.state.categoriaSeleccionada)
                                            {
                                                this.props.hideMenu(true)
                                            }
                                            }}>Categorías</div>
                                        <div className={"tablinks col-6 text-center" + (!this.state.flagCatalogoCategoria ? ' active' : '')} onClick={(e) => {
                                            this.setState({flagCatalogoCategoria: false})
                                            this.props.hideMenu(false)
                                            }}>Todos los productos</div>
                                    </div>
                                ):null}

                                <div> 
                                    

                                    {/* Listado de categorias */}
                                    {this.state.flagCatalogoCategoria && !this.state.categoriaSeleccionada && !this.state.bannerMarketingShow ?
                                        <div className="w-100" style={{marginBottom:'-85px'}}>
                                            <div style={{
                                                paddingBottom: '0px', // padding con seccion destacados
                                                marginTop: '0px',
                                                display: 'grid',
                                                gridGap: '8px',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(98px, 1fr))',
                                                justifyItems: 'center'
                                            }}>
                                                {publicationCategoria.length > 0 ? publicationCategoria.map((card, index) => {

                                                    return <div key={index} className="categoria d-flex justify-content-center align-items-center" onClick={async () => {
                                                        this.setState({categoriaSeleccionada: card})
                                                        this.props.hideMenu(true)
                                                    }}>
                                                        <div className="d-flex justify-content-center align-items-center text-center" style={{color: 'white', fontWeight: '400'}}>
                                                            {card.descripcion}
                                                        </div>
                                                </div>
                                                }) : null }
                                            </div>
                                        </div>
                                    :null }

                                    {/* Nombre categoria */}
                                    {this.state.categoriaSeleccionada && this.state.flagCatalogoCategoria && !this.state.bannerMarketingShow ? 
                                        <div className="w-100 d-flex justify-content-center align-items-center text-center">
                                            <div style={{color: '#5775AA', fontWeight:'bold', fontSize: '16px', marginBottom: '10px'}}>Categoria: {this.state.categoriaSeleccionada.descripcion}</div>
                                        </div>
                                    :null }

                                    {/* Catalogo con categoria */}
                                    { this.state.categoriaSeleccionada !== null ? 
                                    backendrows.filter(e => (this.state.flagCatalogoCategoria && this.state.categoriaSeleccionada ? (e.edicionId > 0) : (typeof (e.edicionId) !== "number")))
                                    .filter(a => JSON.stringify(Object.values(a))
                                    .toLowerCase()
                                    .indexOf(this.state.busquedaPorCategoria.toLowerCase()) !== -1)
                                    .filter(e => (e.productoGrupoIds!==null && e.productoGrupoIds.match(/\d+/g).map(Number).includes(this.state.categoriaSeleccionada.publicacionCategoriaId)))
                                    .map((edicion, index) => { 
                                            return <div key={index} className="d-flex justify-content-between days itemTienda" >
                                                <LazyLoad>                                                      
                                                    <div className="whatsapp-share-button">
                                                        <ReactSVG src={compartir} style={{ cursor: 'pointer'}} onClick={() => this.compartir(edicion)}/>
                                                        </div>
                                                    <figure>  
                                                         {edicion.esInterior === false && edicion.etiquetaDescuento.length > 0 ?<div><figcaption className="titleTagDescuentoItem">{edicion.etiquetaDescuento}</figcaption> </div>:null}
                                                        <img src={edicion.imagen ? `data:image/jpeg;base64,${edicion.imagen}` : `${tiendaUrl}/${edicion.codigoEditor}.png`} onError={this.addDefaultSrc} style={{ maxWidth: "150px" }} alt="placeholder" />
                                                        {edicion.tagMasVendido!==""?<div><figcaption className="titleTagItem">{edicion.tagMasVendido}</figcaption> </div>:null}
                                                    </figure>

                                                    <div style={{marginTop: '5px'}}>
                                                        {this.cardItem(edicion)}
                                                        <div className="w-100 footerItem align-items-center d-flex justify-content-between">
                                                            <div className="f-14 fw-400" style={{maxWidth: '66%'}}>                                                        
                                                                <span>Stock disponible: {edicion.stockDisponibleAlmacen }</span>
                                                            </div>                                                          
                                                            <div className="d-flex justify-content-between align-items-center" style={{ width: '88px' }}>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.cantidad > 0) {
                                                                        edicion.cantidad--
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, -1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen++]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={restar} style={{ color: !edicion.cantidad ? '#EAEAEA' : '#8E95A5', width: '11px' }} />
                                                                </div>
                                                                <div className="f-13-5 fw-400" >
                                                                    {edicion.cantidad}
                                                                </div>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: edicion.stockDisponibleAlmacen <= 0 ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.stockDisponibleAlmacen > 0) {
                                                                        edicion.cantidad++
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, 1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen--]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={sumar} style={{ color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA' : '#8E95A5', width: '11px', height: '18px' }} />
                                                                </div>
                                                                <div>
                                                                    {/* Se agrego para que no seleccione la imagen al hacer doble click en sumar */}
                                                                    &nbsp;
                                                                </div>
                                                            </div>
                                                        </div>

                                                </div>
                                            </LazyLoad>
                                        </div>
                                    
                                    })
                                : null }


                                    {/* Catalogo todas las publicaciones */}
                                    {backendrows.filter(e => (!this.state.flagCatalogoCategoria ? (e.edicionId > 0) : (typeof (e.edicionId) !== "number"))).filter(a => JSON.stringify(Object.values(a)).toLowerCase().indexOf(this.state.busqueda.toLowerCase()) !== -1).map((edicion, index) => {  
                                        
                                        return <div key={index} className="d-flex justify-content-between days itemTienda" >
                                               <LazyLoad>
                                                    <div className="whatsapp-share-button">
                                                        <ReactSVG src={compartir}  style={{ cursor: 'pointer'}} onClick={() => this.compartir(edicion)}/>
                                                        </div>
                                                        
                                                    <figure>
                                                        <div>
                                                        {edicion.esInterior === false && edicion.etiquetaDescuento.length > 0?<figcaption className="titleTagDescuentoItem">{edicion.etiquetaDescuento}</figcaption> :null}
                                                        <img src={edicion.imagen ? `data:image/jpeg;base64,${edicion.imagen}` : `${tiendaUrl}/${edicion.codigoEditor}.png`} onError={this.addDefaultSrc} style={{ maxWidth: "150px" }} alt="placeholder" />
                                                        {edicion.tagMasVendido!==""?<figcaption className="titleTagItem">{edicion.tagMasVendido}</figcaption>:null}
                                                        </div>
                                                        </figure>

                                                    <div style={{marginTop:'5px'}}>
                                                    {this.cardItem(edicion)}
                                                        <div className="w-100 footerItem align-items-center d-flex justify-content-between">
                                                            <div className="f-14 fw-400" style={{maxWidth: '66%',fontWeight:'bold'}}>                                                        
                                                                <span>Stock disponible: {edicion.stockDisponibleAlmacen }</span>
                                                            </div>                                                             <div className="d-flex justify-content-between align-items-center" style={{ width: '88px' }}>
                                                            <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.cantidad > 0) {
                                                                        edicion.cantidad--
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, -1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen++]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={restar} style={{ color: !edicion.cantidad ? '#EAEAEA' : '#8E95A5', width: '11px' }} />
                                                                </div>
                                                                <div className="f-13-5 fw-400">
                                                                    {edicion.cantidad}
                                                                </div>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: edicion.stockDisponibleAlmacen <= 0 ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.stockDisponibleAlmacen > 0) {
                                                                        edicion.cantidad++
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, 1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen--]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={sumar} style={{ color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA' : '#8E95A5', width: '11px', height: '18px' }} />
                                                                </div>
                                                                <div>
                                                                    {/* Se agrego para que no seleccione la imagen al hacer doble click en sumar */}
                                                                    &nbsp;
                                                                </div>
                                                            </div>
                                                        </div>

                                                </div>
                                            </LazyLoad>
                                        </div>
                                })}

                                {this.state.bannerMarketingShow ? (
                                    <React.Fragment>
                                        {/* Descripcion banner */}
                                        <div className="w-100 d-flex justify-content-center align-items-center text-center">
                                            <div style={{color: '#5775AA', fontWeight:'bold', fontSize: '16px', marginBottom: '10px', marginTop:'18px'}}>{this.state.bannerSeleccionado.descripcion}</div>
                                        </div>

                                        {/* Listado de ediciones configuradas */}
                                        {backendrows.filter(a => JSON.stringify(Object.values(a))
                                        .toLowerCase()
                                        .indexOf(this.state.busquedaPorEdicionBanner.toLowerCase()) !== -1)
                                        .filter(e => this.state.bannerEdicionesConfiguradas.indexOf(e.edicionId) !== -1)
                                        .map((edicion, index) => { 
                                            return <div key={index} className="d-flex justify-content-between days itemTienda" >
                                                <LazyLoad>                                                      
                                                    <div className="whatsapp-share-button">
                                                        <ReactSVG src={compartir} style={{ cursor: 'pointer'}} onClick={() => this.compartir(edicion)}/>
                                                        </div>
                                                    <figure>  
                                                         {edicion.esInterior === false && edicion.etiquetaDescuento.length > 0 ?<div><figcaption className="titleTagDescuentoItem">{edicion.etiquetaDescuento}</figcaption> </div>:null}
                                                        <img src={edicion.imagen ? `data:image/jpeg;base64,${edicion.imagen}` : `${tiendaUrl}/${edicion.codigoEditor}.png`} onError={this.addDefaultSrc} style={{ maxWidth: "150px" }} alt="placeholder" />
                                                        {edicion.tagMasVendido!==""?<div><figcaption className="titleTagItem">{edicion.tagMasVendido}</figcaption> </div>:null}
                                                    </figure>

                                                    <div style={{marginTop: '5px'}}>
                                                        {this.cardItem(edicion)}
                                                        <div className="w-100 footerItem align-items-center d-flex justify-content-between">
                                                            <div className="f-14 fw-400" style={{maxWidth: '66%'}}>                                                        
                                                                <span>Stock disponible: {edicion.stockDisponibleAlmacen }</span>
                                                            </div>                                                          
                                                            <div className="d-flex justify-content-between align-items-center" style={{ width: '88px' }}>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.cantidad > 0) {
                                                                        edicion.cantidad--
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, -1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen++]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={restar} style={{ color: !edicion.cantidad ? '#EAEAEA' : '#8E95A5', width: '11px' }} />
                                                                </div>
                                                                <div className="f-13-5 fw-400" >
                                                                    {edicion.cantidad}
                                                                </div>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: edicion.stockDisponibleAlmacen <= 0 ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.stockDisponibleAlmacen > 0) {
                                                                        edicion.cantidad++
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, 1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen--]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={sumar} style={{ color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA' : '#8E95A5', width: '11px', height: '18px' }} />
                                                                </div>
                                                                <div>
                                                                    {/* Se agrego para que no seleccione la imagen al hacer doble click en sumar */}
                                                                    &nbsp;
                                                                </div>
                                                            </div>
                                                        </div>

                                                </div>
                                            </LazyLoad>
                                            </div>
                                        
                                            }) }
                                    </React.Fragment>
                                        
                                ):null}

                            </div>
                            
                        </div>
                        :null)}


                    {/* Banners */}
                    { !this.state.bannerMarketingShow && this.state.flagCatalogoCategoria && !this.state.seleccionadasFlag && !this.state.categoriaSeleccionada && this.state.banners.length > 0 ?
                        <div style={{maxWidth:'550px', marginBottom:'20px', position:'relative', left: '50%', transform:'translate(-50%, 0  )'}}>
                            <Carousel>
                                {this.state.banners.map( (banner, index) => {
                                    return (
                                        <Carousel.Item interval={3000}>                                                    
                                            <img 
                                                className="d-block w-100 carousel-img"
                                                src={banner.urlBanner}
                                                onClick={() =>{ 
                                                    if(banner.tieneConfiguracion)
                                                    {
                                                        this.setState({bannerMarketingShow: true})
                                                        this.props.hideMenu(false)
                                                        const aux = {
                                                            bannerId: banner.bannerId,
                                                            descripcion: banner.descripcion
                                                        }
                                                        this.setState({bannerSeleccionado: aux})
                                                        this.bannerEdicionesConfiguradas(banner.bannerId);
                                                        
                                                    }
                                                   
                                                }}
                                                onError={this.addDefaultBannerSrc}
                                                alt="First slide"
                                            />
                                            
                                        </Carousel.Item>
                                    )
                                    
                                })}
                                
                            </Carousel>
                        </div>
                        
                    : null}


                        {/* Seccion Destacados */}
                        {!this.state.bannerMarketingShow && !this.state.seleccionadasFlag && this.state.flagCatalogoCategoria && !this.state.categoriaSeleccionada ?
                        <div className="pedido" style={{marginBottom:'50px'}}>
                            <div style={{color: '#62759D', fontWeight:'bold', width:'50%', borderBottom:'2px solid black', marginBottom:'20px'}}>
                                    DESTACADOS
                            </div>
                            <div>
                                    
                                    {backendrows.filter(a => JSON.stringify(Object.values(a))
                                    .toLowerCase()
                                    .indexOf(this.state.busquedaPorCategoria.toLowerCase()) !== -1)
                                    .filter(e => (e.productoGrupoIds!==null && e.productoGrupoIds.match(/\d+/g).map(Number).includes(this.state.categoriaId)))
                                    .map((edicion, index) => { 
                                            return <div key={index} className="d-flex justify-content-between days itemTienda" >
                                              <LazyLoad>
                                                    <div className="whatsapp-share-button">
                                                        <ReactSVG src={compartir} style={{ cursor: 'pointer'}} onClick={() => this.compartir(edicion)}/>
                                                    </div>
                                                    <figure>
                                                        {edicion.esInterior === false && edicion.etiquetaDescuento.length > 0?<div><figcaption className="titleTagDescuentoItem">{edicion.etiquetaDescuento}</figcaption> </div>:null}
                                                        <img src={edicion.imagen ? `data:image/jpeg;base64,${edicion.imagen}` : `${tiendaUrl}/${edicion.codigoEditor}.png`} onError={this.addDefaultSrc} style={{ maxWidth: "150px" }} alt="placeholder" />
                                                        {edicion.tagMasVendido!==""?<div><figcaption className="titleTagItem">{edicion.tagMasVendido}</figcaption> </div>:null }
                                                        </figure>

                                                    <div style={{marginTop: '5px'}}>
                                                    {this.cardItem(edicion)}
                                                        <div className="w-100 footerItem align-items-center d-flex justify-content-between">
                                                            <div className="f-14 fw-500" style={{maxWidth: '66%',fontWeight:'bold'}}>                                                        
                                                                <span>Stock disponible: {edicion.stockDisponibleAlmacen }</span>
                                                            </div>                                                          
                                                            <div className="d-flex justify-content-between align-items-center" style={{ width: '88px' }}>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: !edicion.cantidad ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.cantidad > 0) {
                                                                        edicion.cantidad--
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, -1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen++]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={restar} style={{ color: !edicion.cantidad ? '#EAEAEA' : '#8E95A5', width: '11px' }} />
                                                                </div>
                                                                <div className="f-13-5">
                                                                    {edicion.cantidad}
                                                                </div>
                                                                <div className="d-flex justify-content-center align-items-center" style={{ cursor: 'pointer', background: edicion.stockDisponibleAlmacen <= 0 ? '#FCFCFC' : '#F4F4F4', width: '26px', height: '26px', borderRadius: '50%' }} onClick={() => {
                                                                    if (edicion.stockDisponibleAlmacen > 0) {
                                                                        edicion.cantidad++
                                                                        this.tiendaCarritoActualizar(edicion.edicionId, 1)
                                                                        let { backendrows } = this.state
                                                                        let ind = backendrows.findIndex(e => e.edicionId === edicion.edicionId)
                                                                        backendrows[ind] = edicion
                                                                        this.setState({
                                                                            backendrows,
                                                                            stock: [...this.state.stock, edicion.stockDisponibleAlmacen--]
                                                                        })
                                                                    }
                                                                }}>
                                                                    <ReactSVG src={sumar} style={{ color: edicion.stockDisponibleAlmacen <= 0 ? '#EAEAEA' : '#8E95A5', width: '11px', height: '18px' }} />
                                                                </div>
                                                                <div>
                                                                    {/* Se agrego para que no seleccione la imagen al hacer doble click en sumar */}
                                                                    &nbsp;
                                                                </div>
                                                            </div>
                                                        </div>

                                                </div>
                                            </LazyLoad>
                                        </div>
                                    
                                })
                                }

                        </div>
                    </div> : null }

                    {seleccionadasFlag &&  (
                        <div id="boton-enviar" className="d-flex justify-content-center align-items-center barra-enviar">
                            <div className="d-flex justify-content-center align-items-center" onClick={() => {
                                    this.props.hideMenu(false)
                                        this.setState({
                                            seleccionadasFlag: false
                                        })
                                    
                                }
                            
                            } style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "128px", height: "33px"}}>Seguir Comprando
                            
                            </div>
                        </div>
                        
                    )}
                    {this.state.producto.publicacionTipoId !== 2 ? (this.state.backendrows.filter(e => e.cantidad > 0).length !== 0 ? 
                    <div>

                        {seleccionadasFlag? 
                        <div className="barra-precio" style={{backgroundColor:'white', color:'#224372', fontWeight:'bold'}}>
                            <div className="d-flex text-left ml-1">
                                    Total Pedido: ${this.mostrarTotalCompraTienda()}
                            </div>
                        </div>
                        :null }

                                <div id="boton-enviar" className="d-flex justify-content-center align-items-center barra-enviar">
                                    {seleccionadasFlag && (
                                    <div className="d-flex justify-content-center align-items-center" style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "88px", height: "33px"}} onClick={() => {
                                        backendrows.forEach(function(valor, indice, backendrows) {
                                            valor.stockDisponibleAlmacen += valor.cantidad;
                                            valor.cantidad = 0;
                                            backendrows[indice] = valor;
                                        });
                                        this.setState({
                                            backendrows
                                        })
                                        this.tiendaCarritoVaciar(0, null);

                                        
                                    }}>
                                        Vaciar Carrito
                                    </div>
                                    )}
                                    &nbsp;
                                    &nbsp;
                                    {seleccionadasFlag && (
                                    <div className="d-flex justify-content-center align-items-center" onClick={() => {
                                            this.props.hideMenu(false)
                                            if(this.state.backendrows.filter(e => e.cantidad > 0).length > 0 || this.state.diasSemana.filter(e => e.cantidad > 0).length > 0) {
                                                this.setState({
                                                    seleccionadasFlag: !this.state.seleccionadasFlag
                                                })
                                            }
                                            this.props.hideMenu(false)
                                        }
                                    
                                    } style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "115px", height: "33px"}}>Seguir Comprando
                                    
                                    </div>
                                    
                                    )}
                                    &nbsp;
                                    &nbsp;
                                    <div className="d-flex justify-content-center align-items-center" onClick={() => {
                                        this.props.hideMenu(true)
                                        
                                            if(this.state.seleccionadasFlag){
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
                                                        this.setState({loading: true}, () => {
                                                            this.controlMontoDiario();
            
                                                        })
                                                       
                                                    }
                                                })
                                            
                                            } else {
                                                this.verificarStockDisponible();
                                            }
                                        
                                    }
                                    
                                    } style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "105px", height: "33px"}}>{!this.state.seleccionadasFlag?"Ver Carrito":"Confirmar Pedido"}</div>
                                    
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
                                            this.setState({loading: true}, () => {
                                                this.controlMontoDiario();

                                        })
                                       
                                        //this.enviarPedido()
                                    }
                                })
                            }} style={{background: "#224372", color: "white", fontSize: "12px", textAlign: "center", cursor: "pointer", borderRadius: "16px", width: "90px", height: "33px"}}>"Confirmar Pedido"</div>
                        </div>
                        : null)}
                    </React.Fragment>
                    )}
                </div>
                
                </React.Fragment>
                )
    }
}