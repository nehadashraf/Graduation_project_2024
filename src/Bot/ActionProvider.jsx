// in ActionProvider.jsx
import React from "react";
import propTypes from "prop-types";

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleHello = () => {
    const botMessage = createChatBotMessage("Hello. Nice to meet you. ");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
  };
  const handleHelloar = () => {
    const botMessage = createChatBotMessage("هاي ");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
    
  };
  const handleProblem = () => {
    const botMessage = createChatBotMessage("oh.owner will conect with you please Leave your phone number . ");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };
  const handleThanks = () => {
    const botMessage = createChatBotMessage("شكرا...thank you");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };
  const handelwhat = () => {
    const botMessage = createChatBotMessage("ماذا حدث ");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };
  const handleArproblem = () => {
    const botMessage = createChatBotMessage("اوه...سوف يتواصل معك احد من خدمة العملة نرجو ترك رقم تليفونك");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };
  const handleArabic = () => {
    const botMessage = createChatBotMessage("ماشي.");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleHello,handleProblem,handleArabic,handleArproblem,handleHelloar,handelwhat,handleThanks
          },
        });
      })}
    </div>
  );
};

ActionProvider.propTypes = {
  createChatBotMessage: propTypes.node.isRequired,
  children: propTypes.node.isRequired,
  setState: propTypes.node.isRequired,
};

export default ActionProvider
