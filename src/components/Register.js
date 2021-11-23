import React, { Component } from 'react';
import { createBrowserHistory } from 'history'
import { ThemeInput, ThemeButton } from './items';
import ReCAPTCHA from "react-google-recaptcha";
import urlServer from '../server';
import Spinner from './spinner'
import brandLogo from '../assets/brand-logo.png';
import infoRegisterDDR from '../assets/picInfoRegisterDDR.jpg';
import infoRegisterSDDRA from '../assets/picInfoRegisterSDDRA.jpg';
import Login from "../components/login";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import jwt_decode from 'jwt-decode';
import { version } from '../../package.json'
import ReactGA from 'react-ga';
import {Modal} from '@material-ui/core';

const MySwal = withReactContent(Swal)

class Register extends Component {
    constructor(props){
        super(props);
        this.state={
            isLogin: false,
            loginscreen:[],
            username:'',
            lastname:'',
            phone: '',
            iddistri:'',
            infoDistri:[],
            isSociedad:false,
            numline:'',
            numseller:'',
            nameDistri:'',
            namepackage:'',
            codigoSDDRA:'',
            tipoDS:'',
            email:'',
            newpassword:'',
            repassword:'',
            loading: false,
            alert: [],
            loginPage:[],
            tokenCaptcha:'',
            loginmessage:"¿Ya estás registrado? Inicia sesión.",
            landing:[],
            open: false,
            esAmba: true
        }
        this.submit = this.submit.bind(this)
    } 

    history = createBrowserHistory();

    verifyCaptcha = (res) => {
        if(res) {
            this.setState({tokenCaptcha:res})
            console.log('no soy un robot');}            
    }

    // ReCAPTCHA Expired
    expireCaptcha = () => {
        this.setState({ tokenCaptcha: '' })
    }

    validateReq = (data) => {
        this.state.alert = []
        let valid = true;
        
        if (!data.email) {
            this.state.alert.push("* Debes ingresar una cuenta de email válida");
            valid = false;
        }

        let phoneEx = /^(?:(?:00)?549?)?0?(?:11|[2368]\d)(?:(?=\d{0,2}15)\d{2})??\d{8}$/g;
        if(!data.telefono.match(phoneEx) || data.telefono === "undefined" || data.telefono === ""){
            this.state.alert.push("* Debes ingresar un número telefónico válido que contenga el código de área y el número. (Ejemplo: 1151027777)");
            valid = false;
        }

        if (data.nombre === "undefined" || data.nombre === "") {
            this.state.alert.push("* Debes ingresar tu nombre");
            valid = false;
        }

        if (data.apellido === "undefined" || data.apellido === "") {
            this.state.alert.push("* Debes ingresar tu apellido");
            valid = false;
        }

        if (!Number.isFinite(data.distribuidorSucursalId)) {
            this.state.alert.push("* Debes elegir tu distribuidora");
            valid = false;
        }

        if(this.state.codigoSDDRA!=="")
        {
            if(this.state.tipoDS){

                if (!Number.isFinite(data.numeroDeLinea)) {
                    this.state.alert.push("* Debes ingresar el número de línea");
                    valid = false;
                }
                
                if (data.numeroDeVendedor === "undefined" || data.numeroDeVendedor === "" || data.numeroDeVendedor <= 0) {
                    this.state.alert.push("* Debes ingresar el número de vendedor");
                    valid = false;
                }

                if (data.nombreDelPaquete === "undefined" || data.nombreDelPaquete === "") {
                    this.state.alert.push("* Debes ingresar el nombre del paquete");
                    valid = false;
                }

            } else {
                if (data.numeroDeVendedor === "undefined" || data.numeroDeVendedor === "" || data.numeroDeVendedor <= 0) {
                    this.state.alert.push("* Debes ingresar el número de vendedor segun tu resumen de cuenta. Ejemplo: 2218999");
                    valid = false;
                }
                if (data.nombreDelPaquete === "undefined" || data.nombreDelPaquete === "") {
                    this.state.alert.push("* Debes ingresar el nombre del paquete");
                    valid = false;
                }
            }        
        }

        if (data.password === "undefined" || data.password === "") {
            this.state.alert.push("* Debes ingresar la contraseña");
            valid = false;
        }

        if (data.confirmacionPassword === "undefined" || data.confirmacionPassword === "") {
            this.state.alert.push("* Debes confirmar la contraseña");
            valid = false;
        }
       
        if (!data.tokenCaptcha) {
            this.state.alert.push("* Debes verificar que no eres un robot");
            valid = false;
        }

        if (!valid) {
            this.handleOpen();
            // this.setState({
            //     alert
            // })
            // const modal = document.getElementById('modal')
            // modal.click()
        }
        return valid
    }

    cleanFields = () => {
        this.setState({
            username:"",
            lastname:"",
            phone:"",
            iddistri:"",
            numline:"",
            numseller:"",
            namepackage:"",
            codigoSDDRA:"",
            tipoDS:"",
            nameDistri:"",
            email:"",
            newpassword:"",
            repassword:"",
            tokenCaptcha:"",
            esAmba:true
        })
    }

    encodeHTML(s) {
        return s.replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
    };

    guardarDatos = async (data) => {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
          };

        const url = urlServer + `/api/account/usuarioDatosGuardar`;

        const respuesta = await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        })
        .then(async (response) => {

            if (parseInt(response.status) === 200) {
              return console.log('exito');
            } else {
              let err = await response.json();
              err.status = response.status;
              throw err;
            }
          })
        .catch(error => {console.log('error', error)});
        return respuesta
    }

    //SUBMIT DEL LOGIN
    submit = async (event) => {
        const {username, lastname, phone, iddistri, namepackage, numline, numseller,email,newpassword,repassword,tokenCaptcha} = this.state;

        ReactGA.event({
            category: 'Tienda Clarin',
            action: 'Registrar Usuario'
          });

        let payload = {
            "nombre": username,
            "apellido": lastname,
            "telefono": phone,
            "distribuidorSucursalId": iddistri,
            "numeroDeLinea": numline,
            "nombreDelPaquete":namepackage,
            "numeroDeVendedor": numseller,
            "password": newpassword,
            "confirmacionPassword": repassword,
            "email": email,
            "tokenCaptcha": tokenCaptcha
        }
        if (this.validateReq(payload)) {
            this.setState({
                loading: true
            })
            let myHeaders = new Headers();
            myHeaders.append("Accept", "application/json");
            myHeaders.append("Content-Type", "application/json");
            const apiBaseUrl = urlServer + '/api/account/registrar';
            const value = JSON.stringify(payload);
           await fetch(apiBaseUrl, {
                method: 'POST',
                headers: myHeaders,
                body: value,
            })
            .then(async (response)=>{
                let responseText = await response.text();
                const res = JSON.parse(responseText);
                console.log("esto es el response:  "+ res);

                if(response.status === 200)
                {
                    
                    if(res.mensaje !== "")
                    {
                        MySwal.fire({
                            icon: 'success',
                            title: res.mensaje, 
                            showConfirmButton: true
                        })
                        
                        this.cleanFields();
                    }
                    else{
                        // Redireccionar
                        MySwal.fire({
                            icon: 'success',
                            title: 'El alta del usuario fue exitosa',
                            showConfirmButton: false,
                            timer: 2000
                        }).then((result) => {
                            /* Read more about handling dismissals below */
                            if (result.dismiss === Swal.DismissReason.timer) {
                                const token = JSON.parse(res.token);
                                this.cleanFields();
                                this.setState({
                                    loading: false
                                });
                                localStorage.setItem("ddr-auth", JSON.stringify(token));
                                localStorage.setItem("ddr-token", token.token);
                                localStorage.setItem("is_authenticated", "true");
                                localStorage.setItem("token", token.token);
                                localStorage.setItem(
                                    "infoToken",
                                    JSON.stringify(jwt_decode(token.token))
                                );
                                                    
                                window.location = window.location.origin + "/Tienda/CargarPedido";
                            }
                        })
                        
                        
                    }
                    
                }
                else{
                    this.setState({ tokenCaptcha: '', newpassword: '',repassword : ''})
                    
                    let alert = [
                        <b>Error</b>,
                        res.message,
                    ]
                    
                    this.setState({
                        alert
                    })
                    const modal = document.getElementById('modal')
                    modal.click();
                }

                this.setState({
                    loading: false
                }) 
            })
            .catch(error => {
                this.setState({ tokenCaptcha: '', newpassword: '',repassword : ''})

                console.log('error', error); 
                this.setState({
                    loading: false
                })
            })
        }
    }

    redirectLogin = () => {
        this.props.setLogin(<Login parentContext={this} linkRegistrarse={this.props.linkRegistrarse} setLogin={this.props.setLogin} setLanding={this.props.setLanding} loggingOut={this.props.loggingOut} />);
        this.setState({
            loading: false
        })
    }

    getDistribuidoras = async (esAmba) => {
        this.setState({
            loading: true,
            esAmba:esAmba
        })
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        const data = {
            "esAmba":esAmba
        }
        
        const url = urlServer + "/api/distribuidorsucursal/listar"

        await fetch(url, {
            method: 'POST',
            redirect: 'manual',
            headers,
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {

            this.setState({
                infoDistri: result,
                loading: false
            })

            // Quito distiribuidora seleccionada en el combo
            this.setState({iddistri: null})

        })
        .catch(error => {
            console.log('error', error)
            this.setState({
                loading: false
            })
        });
    }

    tipoDistri = (evt) => {
        if(parseInt(evt) === -1){
            this.setState({
                tipoDS: '',
                codigoSDDRA:'',
            })
        }
        this.state.infoDistri.map((d,i) => 
        d.distribuidorSucursalId === parseInt(evt)?
        this.setState({
            tipoDS: d.tipoDS === "SDDRA",
            codigoSDDRA:d.codigoSDDRA,
            iddistri: d.distribuidorSucursalId,
            loading: false
        })
        : null
        )
    }
    
    componentDidMount () {
        this.getDistribuidoras("true")
    }

    handleOpen = () => {
        this.setState({open: true});
      }
    
    render() {
        const { alert, loading } = this.state;

        const handleClose = () => {
            this.setState({open: false})
        };

        return (
            <div id='login' className="register">
                    <div className="login-form">

                            <div className="login-title" >
                                {this.props.linkRegistrarse(
                                <img className="brand-logo" src={brandLogo} alt="brand-logo"></img>
                                )}
                            </div>
        
                            {/* MODAL INFO DISTRIBUIDORA */}
                            <div className="modal fade" id="modalInfoRegister" tabIndex="-1" role="dialog" aria-labelledby="modalInfoRegisterLabel" aria-hidden="true">
                                <div className="modal-dialog-centered modal-dialog justify-content-center" role="document">
                                    <div className="modal-content" style={{background: '#FFF'}}>                                       
                                        {this.state.tipoDS?
                                        <>
                                            <div className="modal-body f-15 text-center" > 
                                                <img className="img-fluid" src={infoRegisterSDDRA} alt="" /> 
                                                <ul>
                                                    <li>N° de distribuidora</li>
                                                    <li>N° de línea</li>
                                                    <li>N° de vendedor</li>
                                                    <li>Nombre del paquete</li> 
                                                </ul>
                                            </div>
                                        </>:   
                                        <>
                                            <div className="modal-body f-15 text-center" id="DDRCloud"> 
                                                <img className="img-fluid" src={infoRegisterDDR} alt="" /> 
                                                <ul>
                                                    <li>N° de vendedor</li>
                                                    <li>Nombre del paquete</li> 
                                                </ul>
                                            </div>
                                            </>
                                              
                                        }
                                                <div className="modal-footer">
                                                    <button type="button" className="btn btn-secondary f-13" data-dismiss="modal" style={{color: '#EA3F3F'}}>Aceptar</button>
                                                </div>
                                    </div>
                                </div>
                            </div>
                            {/* MODAL INFO DISTRIBUIDORA */}

                            {/* MODAL INFO TELEFONO */}
                            <div className="modal fade" id="modalInfoTelefono" tabIndex="-1" role="dialog" aria-labelledby="modalInfoTelefonoLabel" aria-hidden="true">
                                <div className="modal-dialog-centered modal-dialog justify-content-center" role="document">
                                    <div className="modal-content" style={{background: '#FFF'}}>                                
                                        <div className="modal-body f-15 text-left" > 
                                            <ul>
                                                <li>Acepta solo números y sin espacios.</li>
                                                <li>Debes escribir el código de área y seguido el número de teléfono.</li>
                                                <ul> <strong>Ejemplos:</strong>                                                 
                                                    <li>1151027777</li>
                                                    <li>1145183833</li>
                                                    <li>3411118888</li>
                                                    <li>2611234567</li>
                                                </ul>
                                                <li>No acepta el valor 15 en el código de área, en su lugar podes colocar 11.</li>
                                            </ul>
                                        </div>                                    
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary f-13" data-dismiss="modal" style={{color: '#EA3F3F'}}>Aceptar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* MODAL INFO TELEFONO */}
                           
                            {/* MODAL QUE MUESTRA LOS ERRORES DEL LOGIN */}
                            <div className="modal fade" id="errorloginModal" tabIndex="-1" role="dialog" aria-labelledby="errorloginModalLabel" aria-hidden="true">
                                <div className="modal-dialog-centered modal-dialog justify-content-center" role="document">
                                    <div className="modal-content" style={{background: '#EA3F3F'}}>
                                        <div className="modal-body f-15 text-center" >
                                            <ul className="lista-alertas">
                                                {alert.map((al, index) => {
                                                    return <li key={index}> {al} </li>
                                                })}
                                            </ul>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary f-13" data-dismiss="modal" id="btnAceptar">Aceptar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" id="modal" className="btn btn-primary" data-toggle="modal" data-target="#errorloginModal"></button>
                            {/* // MODAL QUE MUESTRA LOS ERRORES DEL LOGIN // */}

                            
                            {/* BLOQUE DE LOGIN */}
                            {loading ?
                                <Spinner />
                            :
                            <div id="login-box">

                                <h4>Registración</h4>
                                <br></br>

                              <label>
                                  <span>Email (Para iniciar sesión)</span>
                              </label>
                                <ThemeInput 
                                    hintText="Email"
                                    labelText="Email"
                                    type="email"
                                    autoComplete="email"
                                    value = {this.state.email}
                                    onChange = {(e) => this.setState({ email: this.encodeHTML(e.target.value) })}
                                    callbackFocus = {this.guardarDatos}
                                />
                                
                                <label>
                                    <span>Teléfono (Sólo números y sin espacios)</span>
                                    <i data-toggle="modal" data-target="#modalInfoTelefono" style={{cursor:"pointer"}}>?</i>
                                </label>
                                <ThemeInput 
                                    hintText={'Código área y número. Ejemplo: 1151027777'}
                                    labelText="Teléfono"
                                    autoComplete="tel"
                                    type="tel"
                                    value = {this.state.phone}
                                    onChange = {(e) => this.setState({ phone: e.target.value })}
                                    callbackFocus = {this.guardarDatos}

                                />
                                <label>
                                    <span>Nombre</span>
                                </label>
                                <ThemeInput 
                                    hintText={'Nombre'}
                                    labelText="Nombre"
                                    autoComplete="nombre"
                                    value = {this.state.username}
                                    onChange = {(e) => this.setState({ username: this.encodeHTML(e.target.value) })}
                                    callbackFocus = {this.guardarDatos}                               
                               />

                                <label>
                                    <span>Apellido</span>
                                </label>
                                <ThemeInput 
                                    hintText={'Apellido'}
                                    labelText="Apellido"
                                    autoComplete="on"
                                    value = {this.state.lastname}
                                    onChange = {(e) => this.setState({ lastname: this.encodeHTML(e.target.value) })}
                                    callbackFocus = {this.guardarDatos}                                
                                />                               

                                
                                <div className="d-flex justify-content-between align-items-center w-400" style={{marginBottom:'8px'}}>   
                                    <div>Ubicacion Distribuidora</div> 
                                    <div className="form-check form-check-inline">
                                        <input type="radio" name="Amba" id="amba" className="form-check-input"
                                            value={true} 
                                            checked={this.state.esAmba === "true" ||this.state.esAmba===true}
                                            onChange={(e)=>this.getDistribuidoras(e.target.value)} />
                                        <label for="amba" className="form-check-label" style={{marginBottom:'-1px'}}>Amba</label>
                                        
                                    </div>
                                    <div className="form-check form-check-inline">    
                                        <input type="radio" name="Interior" id="interior" className="form-check-input"
                                            value={false} 
                                            checked={this.state.esAmba === "false"||this.state.esAmba===false} 
                                            onChange={(e)=>this.getDistribuidoras(e.target.value)} />
                                        <label for="interior" className="form-check-label" style={{marginBottom:'-1px'}}>Interior</label>
                                        
                                    </div> 
                                </div>
                                <label style={{margin: "0 0 3px 0"}}>
                                    <span>Nombre de la distribuidora (Elige tu distribuidora de la lista)</span>
                                    {//<i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                    }
                                </label>
                                <select className="theme-input" id="distribuidoraId" onChange={(evt) => this.tipoDistri(evt.target.value)} value={this.state.iddistri}>
                                    <option value="-1"></option>
                                    {this.state.infoDistri.map(
                                        (d,i) =>
                                            <option key={i} value={d.distribuidorSucursalId}>{d.alias}</option>
                                        )
                                    }
                                </select>
                                
                                {this.state.codigoSDDRA!==""?
                                <>
                                    {this.state.tipoDS?
                                        <>
                                            <label>
                                                <span>N° de la distribuidora</span>
                                                <i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                            </label>
                                            <ThemeInput 
                                                hintText={'N° de la distribuidora'}
                                                labelText="N° de la distribuidora" 
                                                type="number"
                                                value={parseInt(this.state.codigoSDDRA)}
                                                readonly={true}
                                                callbackFocus = {this.guardarDatos}
                                            />
                                            
                                            <label>
                                                <span>N° de línea</span>
                                                <i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                            </label>
                                            <ThemeInput 
                                                hintText={'N° de línea'}
                                                labelText='N° de línea'
                                                type="number"
                                                value = {this.state.numline}
                                                onChange = {(e) => this.setState({ numline: parseInt(e.target.value) })}
                                                callbackFocus = {this.guardarDatos}
                                            />
                                            <label>
                                                <span>N° de vendedor</span>
                                                    <i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                            </label>
                                            <ThemeInput 
                                                    hintText={'N° de vendedor'}
                                                    labelText='N° de vendedor'
                                                    type="number"
                                                    value = {this.state.numseller}
                                                    onChange = {(e) => this.setState({ numseller: parseInt(e.target.value) })}
                                                    callbackFocus = {this.guardarDatos}
                                            />                                            
                                        </>
                                        : <>
                                            <label>
                                                    <span>N° de vendedor según resumen de cuenta</span>
                                                        <i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                            </label>
                                            <ThemeInput 
                                                    hintText={'N° de vendedor según resumen de cuenta'}
                                                    labelText='N° de vendedor'
                                                    type="number"
                                                    value = {this.state.numseller}
                                                    onChange = {(e) => this.setState({ numseller: parseInt(e.target.value) })}
                                                    callbackFocus = {this.guardarDatos}
                                            />
                                        </>
                                    }
                                    <label>
                                        <span>Nombre del paquete</span>
                                        <i data-toggle="modal" data-target="#modalInfoRegister" style={{cursor:"pointer"}}>?</i>
                                    </label>
                                    <ThemeInput 
                                        hintText={"Nombre del paquete"}
                                        labelText="Nombre del paquete"
                                        type="text"
                                        value = {this.state.namepackage}
                                        onChange = {(e) => this.setState({ namepackage: this.encodeHTML(e.target.value) })}
                                        callbackFocus = {this.guardarDatos}
                                    />
                                </>
                                : null
                                }                            

                              <label>
                                  <span>Nueva contraseña (La contraseña debe tener un mínimo de 8 caracteres, una letra mayúscula y un número)</span>
                              </label>
                                <ThemeInput 
                                    hintText="Nueva contraseña"
                                    labelText="Nueva contraseña"
                                    type="password"
                                    autoComplete="new-password"
                                    onChange = {(e) => this.setState({ newpassword: this.encodeHTML(e.target.value) })}
                                    callbackFocus = {this.guardarDatos}                                
                                />

                                <label>
                                    <span>Reingrese la contraseña</span>
                                </label>
                                <ThemeInput 
                                    hintText={"Reingrese la contraseña"}
                                    labelText={"Reingrese la contraseña"}
                                    type="password"
                                    autoComplete="new-password"
                                    onChange = {(e) => this.setState({ repassword: this.encodeHTML(e.target.value) })}
                                    callbackFocus = {this.guardarDatos}
                                />

                                <div style={{transform:'translate(-22px,-5px) scale(.85)'}}>
                                    <ReCAPTCHA 
                                        hl='es'
                                        sitekey={'6LfYGNUZAAAAAByRCBaKGdycLLFokcrRB6V7qb1b'}
                                        render="explicit"  
                                        onChange={this.verifyCaptcha}
                                        onExpired={this.expireCaptcha}
                                    />
                                </div>
                                <p></p>
                                <ThemeButton 
                                    onClick={this.submit}
                                    labelText={'Crear cuenta'}
                                    style={style}
                                />
                                <p></p>

                                {this.props.linkRegistrarse(this.state.loginmessage)}
                                <div className="versionFooter mb-3" >v{version}</div> 
                            </div>
                            }
                            {/* // BLOQUE DE LOGIN // */}

                    </div>


                    <Modal
                        open={this.state.open}
                        onClose={handleClose}>
                        
                            <div style={{
                                  backgroundColor: '#EA3F3F',
                                  color: 'white',
                                  padding: '16px',
                                  maxWidth: '400px',
                                  width: '85%',
                                  height:'auto',
                                  position: 'fixed',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '15px',
                                  fontFamily: 'roboto',
                                  borderRadius: '5px',
                                  overflow: 'auto'
                                  }}>
                                
                                <div align="center">
                                    <ul className="lista-alertas">
                                        {alert.map((al, index) => {
                                          return <li key={index}> {al} </li>;
                                        })}
                                    </ul>
                                </div>
                                <div align="right" style={{marginTop: '15px'}}>
                                    <button style={{
                                              backgroundColor: '#EA3F3F',
                                              borderWidth: '0px',
                                              fontSize: '13px',
                                              color: 'white'}}
                                      type="button" onClick={handleClose}>
                                      Aceptar
                                    </button>
                                </div>
                            </div>

                      </Modal>
                    

                </div>
        );
    }
}

const style = {
    top: 3,
    position: "relative"
};

export default Register;