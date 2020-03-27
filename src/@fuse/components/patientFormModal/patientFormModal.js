import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

import { Modal } from "@fuse";
import { Formik, Form, Field } from "formik";
import { withRouter } from "react-router-dom";
import QuestionEducation from "./QuestionEducation";
import { Button, MuiTextField } from "@material-ui/core";
// import MuiTextField from "@material-ui/core/TextField";
import {
  fieldToTextField,
  TextField,
  TextFieldProps
} from "formik-material-ui";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import MicRecorder from "mic-recorder-to-mp3";
import IconButton from "@material-ui/core/IconButton";
import MicIcon from "@material-ui/icons/Mic";
const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const PatientFormModal = ({
  staticCount,
  dynamicCount,
  modalAction,
  dataModal,
  submitFormCallback,
  updateResponse
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [play, setplay] = useState(true);
  const [stopRecord, setstopRecord] = useState(false);
  const [base64Audio, setbase64Audio] = useState("");

  useEffect(() => {
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  });
  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob);
        setIsRecording(false);
        setBlobURL(blobURL);
        setplay(true);
        setstopRecord(false);
        axios({
          method: "get",
          url: blobURL,
          responseType: "blob"
        }).then(function(response) {
          var reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onloadend = function() {
            var base64data = reader.result;
            base64data = base64data.split(",")[1];
            setbase64Audio(base64data);
          };
        });
      })
      .catch(e => console.log(e));
  };

  const start = () => {
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
          setplay(false);
          setstopRecord(true);
        })
        .catch(e => console.error(e));
    }
  };
  // TIMER START
  const [mSeconds, setMSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setMSeconds(0);
    setIsActive(false);
  }
  useEffect(() => {
    let interval = null;
    if (isActive && mSeconds < 30) {
      interval = setInterval(() => {
        setMSeconds(mSeconds => mSeconds + 1);
      }, 1000);
    } else if (!isActive && mSeconds !== 0) {
      clearInterval(interval);
    }
    if (mSeconds >= 30) {
      clearInterval(interval);
      stop();
      reset();
    }
    return () => clearInterval(interval);
  }, [isActive, mSeconds]);

  const handleClose = id => {
    modalAction(id);
  };

  const getAllState = data => {
    updateResponse(data);
  };

  console.log("dynamicCount,  staticCount,", dynamicCount, staticCount);
  return (
    <Modal className="patientForm" id="PatientForm" ModalAction={modalAction}>
      <div className="modal-header">
        <h4>FORMULAIRE DE MALADIE</h4>
        <button onClick={() => handleClose("PatientForm")}>x</button>
      </div>
      <div className="modal-content">
        {dataModal &&
          dataModal.map(el => {
            return (
              <div className="question-list">
                <h4>{el.label}</h4>
                {el.questions.map((elem, i) => (
                  <QuestionEducation
                    index={i}
                    key={elem.id}
                    getState={getAllState}
                    title={elem.fr_value}
                    description={elem.ar_value}
                    {...elem}
                  />
                ))}
              </div>
            );
          })}
        <h4 className="personnal-question-title">MESSAGE VOCAL</h4>
        <label className="small">
          Vous avez 30 secondes pour décrire votre état et pour qu'on puisse
          mieux vous diagnostiquer
        </label>
        <div className="tim3">
          <div style={{ textAlign: "center" }}>
            {play ? "Cliquez ICI" : mSeconds + "/30"}
            <IconButton
              color={play ? "primary" : "secondary"}
              aria-label="record"
              onClick={() => {
                if (play) {
                  start();
                } else {
                  stop();
                }
                toggle();
              }}
              disabled={stopRecord ? !isRecording : isRecording}
            >
              <MicIcon />
            </IconButton>
            <br></br>
            <div className="tim4">
              <audio src={blobURL} controls="controls" />
            </div>
          </div>
        </div>

        <h4 className="personnal-question-title">Données Personnelles</h4>
        <Formik
          initialValues={{
            email: "",
            nom: "",
            prenom: "",
            adresse: "",
            mytel: "",
            zipcode: ""
          }}
          validate={values => {
            const errors = {};
            // if (!values.email) {
            //   errors.email = "Required";
            // } else if (
            //   !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
            // ) {
            //   errors.email = "Invalid email address";
            // }
            if (values.nom === "") {
              errors.nom = "Required";
            }
            if (values.prenom === "") {
              errors.prenom = "Required";
            }
            /*          if (values.cin === "") {
              errors.cin = "Required";
            } */
            if (values.adresse === "") {
              errors.adresse = "Required";
            } else if (values.adresse.length < 5) {
              errors.adresse = "invalid length";
            }

            if (values.mytel === "") {
              errors.mytel = "Required";
            } else if (values.mytel.length <= 7) {
              errors.mytel = "invalid length";
            }

            if (values.zipcode === "") {
              errors.zipcode = "Required";
            } else if (values.zipcode.length <= 3) {
              errors.zipcode = "zip code must be 4 number";
            }

            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            const caste = {
              firstName: values.prenom,
              lastName: values.nom,
              address: values.adresse,
              zipCode: values.zipcode,
              phoneNumber: values.mytel,
              audio: base64Audio
            };
            submitFormCallback(caste);
          }}
          render={({
            resetForm,
            submitForm,
            isSubmitting,
            values,
            setFieldValue
          }) => (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Form>
                <div
                  style={{
                    margin: 10
                  }}
                >
                  <Field
                    component={TextField}
                    type="text"
                    label="Nom"
                    name="nom"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />
                  <Field
                    component={TextField}
                    type="text"
                    label="Prenom"
                    name="prenom"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />
                </div>
                <div
                  style={{
                    margin: 10
                  }}
                >
                  <Field
                    component={TextField}
                    type="text"
                    label="Adress"
                    name="adresse"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />
                </div>

                {/*  <Field
                    component={TextField}
                    type="text"
                    label="Cin"
                    name="cin"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  /> */}
                <div
                  style={{
                    margin: 10
                  }}
                >
                  <Field
                    component={TextField}
                    type="text"
                    label="Numero de telephone"
                    name="mytel"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />

                  {/* <Field
                    component={UpperCasingTextField}
                    name="email"
                    type="email"
                    label="Email"
                    style={{
                      margin: "0 12px"
                    }}
                  /> */}
                  <Field
                    component={TextField}
                    type="text"
                    label="Zip Code"
                    name="zipcode"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />
                </div>
                {/*                <div
                  style={{
                    margin: 10
                  }}
                >
                  <Field
                    component={TextField}
                    type="number"
                    label="Numerode telephone"
                    name="tel"
                    variant="outlined"
                    style={{
                      margin: "0 12px"
                    }}
                  />
                </div> */}
                <div className="action-buttons">
                  <Button
                    className="cancel"
                    variant="outlined"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={() => {
                      resetForm();
                      handleClose("PatientForm");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={() => {
                      if (staticCount === dynamicCount) {
                        submitForm();
                      } else {
                        alert("Merci de répondre à toutes les questions");
                      }
                    }}
                  >
                    Valider
                  </Button>
                </div>
              </Form>
            </MuiPickersUtilsProvider>
          )}
        />
      </div>
    </Modal>
  );
};

export default withRouter(PatientFormModal);
