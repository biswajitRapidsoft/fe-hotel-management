import React from "react";

import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Paper,
  styled,
  TextField,
} from "@mui/material";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
export const checkedIcon = (
  <CheckBoxIcon fontSize="small" sx={{ color: "#280071" }} />
);
export const StyledCalendarIcon = styled(CalendarMonthIcon)({
  color: "#9380B8",
});

export const CustomButton = React.memo(({ children, ...props }) => {
  return (
    <Button
      {...props}
      variant="contained"
      sx={{
        color: "#FFFFFF",
        fontWeight: 600,
        textTransform: "none",
        fontSize: 18,
        "&.Mui-disabled": {
          background: "#B2E5F6",
          color: "#FFFFFF",
        },
      }}
    >
      {children}
    </Button>
  );
});

export const CustomTextField = React.memo(
  ({ label, isRequired = false, ...props }) => {
    return (
      <TextField
        sx={{
          ".MuiInputBase-root": {
            color: "#747474",
          },
          ".MuiFormLabel-root": {
            color: (theme) => `${theme.palette.primary.main}`,
            fontWeight: 600,
            fontSize: 18,
          },
          ".css-7ep22d-MuiInputBase-root-MuiInput-root::before": {
            borderBottom: (theme) =>
              `1px solid ${theme.palette.primary.main} !important`,
          },
        }}
        label={
          <React.Fragment>
            {label}{" "}
            {isRequired && (
              <Box
                component="span"
                sx={{
                  color: (theme) => theme.palette.secondary.main,
                }}
              >
                *
              </Box>
            )}
          </React.Fragment>
        }
        {...props}
        variant="standard"
        autoComplete="off"
        fullWidth
      />
    );
  }
);

export const CustomAutocomplete = React.memo(
  ({ label, isRequired = false, options, ...props }) => {
    return (
      <Autocomplete
        {...props}
        clearOnEscape
        disablePortal
        options={options}
        popupIcon={<KeyboardArrowDownIcon color="primary" />}
        sx={{
          "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
            backgroundColor: "#E9E5F1",
            color: "#280071",
            fontWeight: 600,
          },
          "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected='true']:hover":
            {
              backgroundColor: "#E9E5F1",
              color: "#280071",
              fontWeight: 600,
            },
        }}
        clearIcon={<ClearIcon color="primary" />}
        PaperComponent={(props) => (
          <Paper
            sx={{
              background: "#FFFFFF",
              color: "#747474",
              borderRadius: "10px",
            }}
            {...props}
          />
        )}
        renderInput={(params) => (
          <CustomTextField
            {...params}
            label={
              <React.Fragment>
                {label}{" "}
                {isRequired && (
                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.secondary.main,
                    }}
                  >
                    *
                  </Box>
                )}
              </React.Fragment>
            }
            variant="standard"
          />
        )}
      />
    );
  }
);

export const CustomAutocompleteMultiSelect = React.memo(
  ({ label, isRequired = false, options, labelRenderer, ...props }) => {
    return (
      <Autocomplete
        {...props}
        multiple
        disableCloseOnSelect
        clearOnEscape
        disablePortal
        options={options}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={props.key}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {labelRenderer(option)}
          </li>
        )}
        renderTags={(list) =>
          list.map((item) => labelRenderer(item)).join(", ")
        }
        popupIcon={<KeyboardArrowDownIcon color="primary" />}
        sx={{
          "& + .MuiAutocomplete-popper .MuiAutocomplete-option:hover": {
            backgroundColor: "#E9E5F1",
            color: "#280071",
            fontWeight: 600,
          },
          "& + .MuiAutocomplete-popper .MuiAutocomplete-option[aria-selected='true']:hover":
            {
              backgroundColor: "#E9E5F1",
              color: "#280071",
              fontWeight: 600,
            },
        }}
        clearIcon={<ClearIcon color="primary" />}
        PaperComponent={(props) => (
          <Paper
            sx={{
              background: "#FFFFFF",
              color: "#747474",
              borderRadius: "10px",
            }}
            {...props}
          />
        )}
        renderInput={(params) => (
          <CustomTextField
            {...params}
            label={
              <React.Fragment>
                {label}{" "}
                {isRequired && (
                  <Box
                    component="span"
                    sx={{
                      color: (theme) => theme.palette.secondary.main,
                    }}
                  >
                    *
                  </Box>
                )}
              </React.Fragment>
            }
            variant="standard"
          />
        )}
      />
    );
  }
);

export const CustomDatePicker = React.memo(({ label, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...props}
        sx={{
          ".MuiInputBase-root": {
            color: "#747474",
          },
          ".MuiFormLabel-root": {
            color: (theme) => `${theme.palette.primary.main}`,
            fontWeight: 600,
            fontSize: 18,
          },
          ".css-1l26fxc-MuiInputBase-root-MuiInput-root::before": {
            borderBottom: (theme) =>
              `1px solid ${theme.palette.primary.main} !important`,
          },
          width: "100%",
        }}
        label={
          <React.Fragment>
            {label}{" "}
            <Box
              component="span"
              sx={{
                color: (theme) => theme.palette.secondary.main,
              }}
            >
              *
            </Box>
          </React.Fragment>
        }
        slotProps={{
          textField: { variant: "standard", readOnly: true },
        }}
        slots={{
          openPickerIcon: StyledCalendarIcon,
        }}
        format="DD/MM/YYYY"
      />
    </LocalizationProvider>
  );
});
