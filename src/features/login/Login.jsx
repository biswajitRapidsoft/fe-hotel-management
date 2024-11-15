import { Box } from "@mui/material";
import React from "react";
import {
  CustomButton,
  CustomTextField,
  CustomAutocomplete,
  CustomAutocompleteMultiSelect,
  CustomDatePicker,
} from "../../components/CustomElements";

const Login = () => {
  return (
    <Box
      sx={{
        padding: 2,
        background: "#ccc",
      }}
    >
      <CustomTextField label={"Description"} isRequired={true} />
      <CustomButton color="secondary">Add recommendation</CustomButton>
      <CustomAutocomplete options={["ok", "YO gouys"]} label="Nameee" />
      <CustomAutocompleteMultiSelect
        options={["ok", "YO gouys"]}
        label="Nameee"
        labelRenderer={(option) => option}
      />
      <CustomDatePicker label={"Select Date"} />
    </Box>
  );
};

export default Login;
