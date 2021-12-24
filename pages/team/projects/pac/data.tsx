import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import InputMask from "react-input-mask";

import showToast from "@lib/notification";

import SelfSchedulingHeader from "@components/autoscheduling/Header";
import { TextField } from "@components/form/fields";
import Button from "@components/ui/Button";
import PhoneInput from "@components/ui/form/PhoneInput";

import { IBeneficiary, setSSBeneficiary } from "../../../../common/utils/localstorage";
import {
  validateCpf,
  validateEmail,
  validateGroup,
  validateName,
  validatePhone,
} from "../../../../common/utils/validators";

type TError = "email" | "beneficiary" | "document" | "phone" | "group";

export default function PersonalData() {
  const router = useRouter();

  const [email, setEmail] = useState<string>();
  const [name, setName] = useState<string>();
  const [document, setDocument] = useState<string>();
  const [phone, setPhone] = useState<string>();
  const [group, setGroup] = useState<string>();
  const [notes, setNotes] = useState<string>();

  const [error, setError] = useState<TError>();

  const handleSubmit = () => {
    if (!name || !validateName(name)) {
      setError("beneficiary");
      return;
    }
    if (!email || !validateEmail(email)) {
      setError("email");
      return;
    }
    if (!document || !validateCpf(document)) {
      setError("document");
      return;
    }
    if (!group || !validateGroup(group)) {
      setError("group");
      return;
    }
    if (!phone || !validatePhone(phone)) {
      setError("phone");
      return;
    }

    const beneficiary: IBeneficiary = {
      name,
      email,
      document,
      phone,
      group,
      notes,
    };

    setSSBeneficiary(beneficiary);
    router.push({ pathname: "service", query: router.query });
  };

  const handleBack = () => {
    router.push({ pathname: "terms", query: router.query });
  };

  useEffect(() => {
    console.log(phone);
  }, [phone]);

  useEffect(() => {
    if (error) {
      let errorMessage = "";
      switch (error) {
        case "beneficiary":
          errorMessage = "Por favor, digite o seu nome completo.";
          break;
        case "email":
          errorMessage = "Por favor, digite o um email válido.";
          break;
        case "document":
          errorMessage = "Por favor, digite um CPF válido.";
          break;
        case "group":
          errorMessage =
            "Por favor, digite o seu grupo corretamente. Um grupo válido é um número entre 1 e 100.";
          break;
        case "phone":
          errorMessage = "Por favor, digite um número de telefone válido.";
          break;
      }
      showToast(errorMessage, "error");
      setError(undefined);
    }
  }, [error]);

  return (
    <>
      <div>
        <Toaster position="top-center" />
      </div>
      <div className="bg-gray-200 h-screen flex flex-col justify-between">
        <div className="p-4 bg-white">
          <SelfSchedulingHeader page="data" />
          <div className="mt-4">
            <TextField
              required
              className="my-4"
              name="beneficiary"
              label="Nome do Beneficiário:"
              placeholder="Insira o nome da pessoa a ser atendida"
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              required
              className="my-4"
              name="email"
              label="E-mail:"
              placeholder="Insira o e-mail"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="my-4">
              <label htmlFor="cpf" className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                CPF:
              </label>
              <InputMask
                required
                id="cpf"
                type="text"
                className="block w-full border-gray-300 rounded-sm shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-brand sm:text-sm"
                placeholder="Insira o CPF da pessoa a ser atendida"
                mask="999.999.999-99"
                maskPlaceholder="_"
                onChange={(e) => setDocument(e.target.value)}
              />
            </div>
            <div className="my-4">
              <label className="text-sm font-medium text-gray-700" htmlFor="phone">
                Número de telefone:
              </label>
              <PhoneInput
                name="phone"
                defaultCountry="BR"
                value={phone}
                className="text-base"
                placeholder="Insira um número de contato"
                onChange={(value: string) => setPhone(value)}
              />
            </div>
            <TextField
              name="group"
              label="Grupo:"
              placeholder="Insira o grupo"
              onChange={(e) => setGroup(e.target.value)}
            />
            <p className="text-xs text-gray-500 mb-4 text-justify">
              Acompanhe o progresso de atendimento dos grupos através da nossa plataforma.
            </p>
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notas adicionais
            </label>
            <textarea
              name="notes"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-sm shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 sm:text-sm"
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="min-h-24 bg-white py-2 px-4 drop-shadow-[0_-4px_8px_rgba(0,0,0,0.08)]">
          <div className="flex flex-row w-full">
            <Button color="secondary" className="w-full justify-center" onClick={handleBack}>
              Anterior
            </Button>
            <Button className="w-full ml-4 justify-center" onClick={handleSubmit}>
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
