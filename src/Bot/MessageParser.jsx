import React from "react";
import propTypes from "prop-types";
const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    if (message.includes("hello")) {
      actions.handleHello();
    }
    else if(message.includes("hi")){
      actions.handleHello();

    }
    else if(message.includes("هاي")){
      actions.handleHelloar();

    }
    else if(message.includes("مساء الخير")){
      actions.handleHello();

    }
    else if(message.includes(" الدليفري")){
      actions.handelwhat();

    }
    else if(message.includes("صباح الخير")){
      actions.handleHello();

    }
    else if(message.includes("صباح")){
      actions.handleHello();
    }
    else if(message.includes("مساء")){
      actions.handleHello();

    }
    else if(message.includes("مشكلة")){
      actions.handleArproblem();

    }
    else if(message.includes("problem")){
      actions.handleProblem();

    }
    else if(message.includes("عربي")){
    actions.handleArabic();
    }
    else if(message.includes("01")){
      actions.handleThanks();
      }
      
    else{
      actions.handleArproblem() || actions.handleProblem();


    }
  };
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          parse: parse,
          actions: {},
        });
      })}
    </div>
  );
};
MessageParser.propTypes = {
  children: propTypes.isRequired,
  actions: propTypes.isRequired,
};

export default MessageParser;
