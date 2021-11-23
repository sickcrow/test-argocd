import * as React from "react";
import { Title } from "../components/title";
import { ReactSVG } from "react-svg";
import Spinner from "../components/spinner";
import urlServer from "../server";
import restar from "../assets/restar.svg";
import sumar from "../assets/sumar.svg";
import AsyncSelect from "react-select/async";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal);

export default class Devoluciones extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      plantillaSelected: {},
      plantillas: [],
      plantillaEdiciones: [],
    };
  }

  reqPlantillas = async (string) => {
    const palabras = string ? string : "";
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.token,
    };
    const data = {
      palabrasABuscar: palabras,
    };
    const respuesta = await fetch(
      urlServer +
        "/api/plantilla/devolucion/" +
        JSON.parse(localStorage.infoToken).entidad_id,
      {
        method: "POST",
        redirect: "manual",
        body: JSON.stringify(data),
        headers,
      }
    )
      .then((response) => response.text())
      .catch((error) => {
        console.log("error", error);
      })
      .then((result) => {
        const res = JSON.parse(result);

        let options = res.map((pub) => {
          return {
            value: pub.plantillaId,
            label:
              pub.yaCerrada || pub.yaCargada
                ? pub.descripcion + " "
                : pub.descripcion,
          };
        });
        options = [...options];
        this.setState({
          plantillas: JSON.parse(result),
          options,
        });
        return options;
      })
      .catch((error) => {
        console.log("error", error);
      });
    return respuesta;
  };

  reqEdiciones = async (plantillaId) => {

    ReactGA.event({
      category: 'Devoluciones',
      action: 'Listar Ediciones'
    });

    this.setState({
      loading: true,
    });
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.token,
    };
    const respuesta = await fetch(
      urlServer +
        "/api/distribucion/devolucionRapida/plantilla/" +
        plantillaId +
        "/pv/" +
        JSON.parse(localStorage.infoToken).entidad_id,
      {
        method: "POST",
        redirect: "manual",
        body: JSON.stringify(),
        headers,
      }
    )
      .then((response) => response.text())
      .catch((error) => {
        console.log("error", error);
        this.setState({
          loading: false,
        });
      })
      .then((result) => {
        let res = JSON.parse(result);

        res.ediciones = res.ediciones.map((edicion) => {
          edicion.cantidadDevuelta = 0;
          return edicion;
        });

        this.setState({
          plantillaEdiciones: [],
        });
        this.setState({
          plantillaEdiciones: res,
          loading: false,
        });
        return result;
      })
      .catch((error) => {
        console.log("error", error);
        this.setState({
          loading: false,
        });
      });
    return respuesta;
  };

  componentDidMount() {
    document.title = "Devoluciones";
    this.reqPlantillas();

    // DEFINE INTERVALO DE AUTOGUARDADO CADA 15 SEGUNDOS
    this.interval = setInterval(() => {
      if (this.state.plantillaSelected) {
        if (this.state.plantillaEdiciones.ediciones) {
          if (
            this.state.plantillaEdiciones.ediciones.filter(
              (e) => e.cantidadDevuelta !== 0
            ).length !== 0
          ) {
            this.guardarPlantilla();
          }
        }
      }
    }, 15000);
  }

  // MANEJA LA SELECCIÓN DE PLANTILLA
  handleChange = async (newValue) => {
    const { plantillas } = this.state;
    if (newValue) {
      const plantillaSelected = plantillas.filter(
        (a) => parseInt(a.plantillaId) === parseInt(newValue.value)
      )[0];
      if (newValue.value) {
        // await this.setState({
        //   plantillaSelected: {},
        // });
        this.setState({
          plantillaSelected,
          plantillaValue: null,
        });
        this.reqEdiciones(newValue.value);
      }
    }
    return newValue;
  };

  guardarPlantilla = async () => {
    const plantilla = this.state.plantillaSelected;
    const { plantillaEdiciones } = this.state;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.token,
    };
    const data = {
      plantillaId: plantilla.plantillaId,
      puntoVentaId: JSON.parse(localStorage.infoToken).entidad_id,
      devoluciones: plantillaEdiciones.ediciones
        .filter((e) => e.cantidadDevuelta !== 0)
        .map((edicion) => {
          const {
            edicionDistribuidorSucursalId,
            edicionId,
            cantidadDevuelta,
          } = edicion;
          return {
            edicionDistribuidorSucursalId,
            edicionId,
            carga: cantidadDevuelta,
          };
        }),
    };
    console.log(data);
    const respuesta = await fetch(
      urlServer +
        "/api/distribucion/devolucionRapida/plantilla/" +
        plantilla.plantillaId +
        "/pv/" +
        JSON.parse(localStorage.infoToken).entidad_id +
        "/grabar",
      {
        method: "POST",
        redirect: "manual",
        body: JSON.stringify(data),
        headers,
      }
    )
      .then((response) => response.text())
      .catch((error) => {
        console.log("error", error);
      })
      .then((result) => {
        this.reqEdiciones(plantilla.plantillaId);
        return result;
      })
      .catch((error) => {
        console.log("error", error);
      });
    return respuesta;
  };

  cerrarPlantilla = async () => {
    MySwal.fire({
      title: "Confirmación de cierre de devolución",
      text: "¿Desea cerrar las devoluciones? Esta acción no podrá deshacerse",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.value) {

        ReactGA.event({
          category: 'Devoluciones',
          action: 'Cerrar Devolucion'
        });
        
        
        let resp = null;
        
        if (
          this.state.plantillaEdiciones.ediciones.filter(
            (e) => e.cantidadDevuelta !== 0
          ).length !== 0
        ) {
          resp = await this.guardarPlantilla();
          resp = JSON.parse(resp);
        }
        
        
        if(resp !== null && resp.exito === false)
        {
            // muestro mensaje de error
            //var a = null;
            var arreglo = resp.devoluciones.devoluciones;
            var mensaje = '';
            for(var a = 0; arreglo.length; a++)
            {
                mensaje = arreglo[a].mensaje;
                if(mensaje !== '')
                {
                    MySwal.fire({
                      icon: "error",
                      title: mensaje,
                      showConfirmButton: true,
                    });
                    break;
                }
            }
        } 
        else {
          // Cerrar Plantilla          
          const plantilla = this.state.plantillaSelected;
          const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.token,
          };
          const respuesta = await fetch(
            urlServer +
              "/api/distribucion/devolucionRapida/plantilla/" +
              plantilla.plantillaId +
              "/pv/" +
              JSON.parse(localStorage.infoToken).entidad_id +
              "/cerrar",
            {
              method: "POST",
              redirect: "manual",
              body: JSON.stringify(),
              headers,
            }
          )
            .then((response) => response.text())
            .catch((error) => {
              console.log("error", error);
            })
            .then(async (result) => {
              MySwal.fire({
                icon: "success",
                title: "Devolución enviada con éxito",
                showConfirmButton: false,
                timer: 1500,
              }).then(async (res) => {
                const newValue = await this.reqPlantillas(plantilla.descripcion);
                this.handleChange(newValue[0]);
              });
              return result;
            })
            .catch((error) => {
              console.log("error", error);
            });
          return respuesta;
        }
      }
    });
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    this.props.hideMenu(true);
  }

  render() {
    const { loading, plantillaSelected, plantillaEdiciones } = this.state;

    return (
      <div id="devoluciones" className="container text-left">
        <Title title="Devoluciones" />

        {/* REQUIERE PLANTILLAS */}
        <div className="w-100 " style={{ marginBottom: "10px" }}>
          <AsyncSelect
            className="fontAwesome"
            inputId="busqueda"
            value={this.state.plantillaValue}
            cacheOptions
            defaultOptions={this.state.options}
            id="test"
            loadOptions={this.reqPlantillas}
            onChange={this.handleChange}
            noOptionsMessage={() => "Escriba el nombre de una plantilla"}
            placeholder={"Búsqueda por Plantilla"}
          />
        </div>
        {/* // REQUIERE PLANTILLAS // */}

        <div className="text-center f-16 fw-400">
          {plantillaSelected ? (
            plantillaSelected.yaCerrada ? (
              <React.Fragment>
                {plantillaSelected.descripcion}{" "}
                <span className="fontAwesome"></span>
              </React.Fragment>
            ) : (
              plantillaSelected.descripcion
            )
          ) : null}
        </div>
        {loading ? (
          <Spinner style={{ fontSize: "8px" }} />
        ) : (
          <React.Fragment>
            <div className="cards">
              {/* ITERANDO EDICIONES */}
              {plantillaEdiciones.ediciones
                ? plantillaEdiciones.ediciones.map((edicion, index) => {
                    console.log("plantilla", plantillaSelected);
                    console.log(
                      plantillaEdiciones
                        ? plantillaEdiciones.yaCargada
                        : "sin dato"
                    );
                    return (
                      <div
                        key={index}
                        className="box d-flex justify-content-between align-items-center days"
                      >
                        <div className="">
                          <div
                            style={{
                              color: "#EA3F3F",
                              fontWeight: "300",
                              fontSize: "16px",
                            }}
                          >
                            {edicion.edicionDescripcion}
                          </div>
                          <div className="desc-reclamo">
                            ED
                            <span className="ml-1">
                              {edicion.edicionDescripcionActual
                                .replace("Ed. ", "")
                                .replace("Ed.", "")}
                            </span>
                          </div>
                          <div className="desc-reclamo">
                            CARGA
                            <span className="ml-1">{edicion.carga}</span>
                          </div>
                          <div className="badge badge-theme-red f-13-5 mt-1">
                            {edicion.pedido}
                          </div>
                        </div>
                        <div
                          className="d-flex justify-content-between align-items-center"
                          style={{ width: "88px", minWidth: "88px" }}
                        >
                          {plantillaEdiciones &&
                          (plantillaEdiciones.yaCerrada ||
                            plantillaEdiciones.yaCargada) ? (
                            <span
                              style={{ fontSize: 35 }}
                              className="fontAwesome"
                            >
                              
                            </span>
                          ) : (
                            <React.Fragment>
                              {/* BOTON RESTAR CANTIDAD */}
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                  cursor: "pointer",
                                  background:
                                    edicion.devolucionesPorPlantilla +
                                      edicion.cantidadDevuelta ===
                                      0 ||
                                    (plantillaSelected &&
                                      plantillaSelected.yaCerrada)
                                      ? "#FCFCFC"
                                      : "#F4F4F4",
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                }}
                                onClick={() => {
                                  if (
                                    edicion.devolucionesPorPlantilla +
                                      edicion.cantidadDevuelta >
                                      0 &&
                                    !(
                                      plantillaSelected &&
                                      plantillaSelected.yaCerrada
                                    )
                                  ) {
                                    edicion.cantidadDevuelta--;
                                    let {
                                      ediciones,
                                    } = this.state.plantillaEdiciones;
                                    let ind = ediciones.findIndex(
                                      (e) => e.edicionId === edicion.edicionId
                                    );
                                    ediciones[ind] = edicion;
                                    this.setState({
                                      plantillaEdiciones: {
                                        ...this.state.plantillaEdiciones,
                                        ediciones,
                                      },
                                    });
                                  }
                                }}
                              >
                                <ReactSVG
                                  src={restar}
                                  style={{
                                    color:
                                      edicion.devolucionesPorPlantilla +
                                        edicion.cantidadDevuelta ===
                                        0 ||
                                      (plantillaSelected &&
                                        plantillaSelected.yaCerrada)
                                        ? "#EAEAEA"
                                        : "#8E95A5",
                                    width: "11px",
                                  }}
                                />
                              </div>
                              {/* // BOTON RESTAR CANTIDAD // */}

                              {/* CANTIDAD A MOSTRAR */}
                              <div
                                className="f-13-5"
                                style={{
                                  color: !plantillaSelected.yaCerrada
                                    ? "inherit"
                                    : "gray",
                                }}
                              >
                                {edicion.devolucionesPorPlantilla +
                                  (edicion.cantidadDevuelta
                                    ? edicion.cantidadDevuelta
                                    : 0)}
                              </div>
                              {/* // CANTIDAD A MOSTRAR // */}

                              {/* BOTON SUMAR CANTIDAD */}
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                  cursor: "pointer",
                                  background:
                                    edicion.carga > edicion.cantidadDevuelta &&
                                    !plantillaSelected.yaCerrada
                                      ? "#F4F4F4"
                                      : "#FCFCFC",
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                }}
                                onClick={() => {
                                  if (
                                    edicion.carga >
                                      edicion.devolucionesPorPlantilla +
                                        edicion.cantidadDevuelta &&
                                    !plantillaSelected.yaCerrada
                                  ) {
                                    edicion.cantidadDevuelta++;
                                    let {
                                      ediciones,
                                    } = this.state.plantillaEdiciones;
                                    let ind = ediciones.findIndex(
                                      (e) => e.edicionId === edicion.edicionId
                                    );
                                    ediciones[ind] = edicion;
                                    this.setState({
                                      plantillaEdiciones: {
                                        ...this.state.plantillaEdiciones,
                                        ediciones,
                                      },
                                    });
                                  }
                                }}
                              >
                                <ReactSVG
                                  src={sumar}
                                  style={{
                                    width: "11px",
                                    height: "18px",
                                    color:
                                      edicion.carga >
                                        edicion.cantidadDevuelta &&
                                      !plantillaSelected.yaCerrada
                                        ? "#8E95A5"
                                        : "#EAEAEA",
                                  }}
                                />
                              </div>
                              {/* // BOTON SUMAR CANTIDAD // */}
                            </React.Fragment>
                          )}
                        </div>
                      </div>
                    );
                  })
                : null}
              {/* // ITERANDO EDICIONES // */}
            </div>

            {/* BOTON ENVIAR (para cerrar plantilla) */}
            {plantillaEdiciones.length !== 0 &&
            plantillaSelected &&
            !plantillaSelected.yaCerrada ? (
              <div
                id="boton-enviar"
                className="d-flex justify-content-center align-items-center barra-enviar"
              >
                <div
                  className="d-flex justify-content-center align-items-center"
                  onClick={() => {
                    this.cerrarPlantilla();
                  }}
                  style={{
                    background: "#224372",
                    color: "white",
                    fontSize: "12px",
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: "16px",
                    width: "90px",
                    height: "33px",
                  }}
                >
                  Enviar
                </div>
              </div>
            ) : null}
            {/* // BOTON ENVIAR (para cerrar plantilla) // */}
          </React.Fragment>
        )}
      </div>
    );
  }
}
