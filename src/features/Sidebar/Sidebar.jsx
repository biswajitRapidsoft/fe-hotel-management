import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Divider, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { MdOutlineCleaningServices } from "react-icons/md";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import { FaParking } from "react-icons/fa";
import { MdHistory } from "react-icons/md";

// import GroupsIcon from "@mui/icons-material/Groups";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
// import AltRouteIcon from "@mui/icons-material/AltRoute";
import KingBedIcon from "@mui/icons-material/KingBed";
import RoofingIcon from "@mui/icons-material/Roofing";
import { FRONTDESK, HOUSEKEEPER, GUARD } from "../../helper/constants";
import SpaIcon from "@mui/icons-material/Spa";
const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 15px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 15px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  zIndex: theme.zIndex.appBar - 1,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const sideBarMenuOptions = [
  {
    pathname: "/dashboard",
    isLibraryIcon: true,
    menuIcon: <KingBedIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Room Logo",
    menuTitle: "Rooms",
    visibility: [FRONTDESK],
  },
  {
    pathname: "/hallBookings",
    isLibraryIcon: true,
    menuIcon: <RoofingIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Hall Logo",
    menuTitle: "Halls",
    visibility: [FRONTDESK],
  },
  // {
  //   pathname: "/CustomerList",
  //   isLibraryIcon: true,
  //   menuIcon: <GroupsIcon sx={{ color: "#fff" }} />,
  //   menuIconAlt: "Group Logo",
  //   menuTitle: "Restaurant",
  // },
  {
    pathname: "/registerlist",
    isLibraryIcon: true,
    menuIcon: <AccountBoxIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Dashboard Logo",
    menuTitle: "Parking area",
  },
  // {
  //   pathname: "/Reservation",
  //   isLibraryIcon: true,
  //   menuIcon: <AltRouteIcon sx={{ color: "#fff" }} />,
  //   menuIconAlt: "Activity Logo",
  //   menuTitle: "Reservation",
  // },
  {
    pathname: "/HouseKeepingHistory",
    isLibraryIcon: true,
    menuIcon: <MdOutlineCleaningServices style={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Service Request",
    visibility: [FRONTDESK],
  },
  {
    pathname: "/spa-admin",
    isLibraryIcon: true,
    menuIcon: <SpaIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Spa Logo",
    menuTitle: "Spa",
    visibility: [FRONTDESK],
  },
  {
    pathname: "/housekeeper-dashboard",
    isLibraryIcon: true,
    menuIcon: <DashboardIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Dashboard",
    visibility: [HOUSEKEEPER],
  },
  {
    pathname: "/LaundryHistory",
    isLibraryIcon: true,
    menuIcon: <DryCleaningIcon sx={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Laundry History",
    visibility: [HOUSEKEEPER],
  },
  {
    pathname: "/CleaningServiceHistory",
    isLibraryIcon: true,
    menuIcon: <MdOutlineCleaningServices style={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Cleaning History",
    visibility: [HOUSEKEEPER],
  },
  {
    pathname: "/Parking",
    isLibraryIcon: true,
    menuIcon: <FaParking style={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Parking Dashboard",
    visibility: [GUARD],
  },
  {
    pathname: "/ParkingHistory",
    isLibraryIcon: true,
    menuIcon: <MdHistory style={{ color: "#fff" }} />,
    menuIconAlt: "Activity Logo",
    menuTitle: "Parking History",
    visibility: [GUARD],
  },
];

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const activeListBgColor = "#624598";
  const inactiveListBgColor = "#ffffff00";

  // Handle hover open and close
  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  const handleSelectListItem = (pathname) => {
    navigate(pathname);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        open={open}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        PaperProps={{
          sx: {
            // background: (theme) =>
            //   ` ${theme.palette.primary.main}`,
            backgroundColor: "#4C2B89",
            border: 0,
            color: "#000000",
            fontSize: "20px",
            overflowY: "auto",
          },
        }}
      >
        <List sx={{ paddingX: open ? "15px" : "5px", mt: "5em" }}>
          {sideBarMenuOptions.length > 0 &&
            sideBarMenuOptions
              ?.filter((item) =>
                item?.visibility?.includes(
                  JSON.parse(sessionStorage.getItem("data"))?.roleType
                )
              )
              ?.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    key={index}
                    disablePadding
                    sx={{
                      display: "flex",
                      bgcolor:
                        window.location.pathname === item?.pathname
                          ? activeListBgColor
                          : inactiveListBgColor,
                      "&:hover": {
                        //   bgcolor: "#B6D5E5",
                        bgcolor: "#624598",
                      },
                      borderRadius: "8px",
                      minHeight: "3.2em",
                      mt: index === 0 ? 0 : "12px",
                    }}
                    onClick={() => handleSelectListItem(item?.pathname)}
                  >
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                        "&:hover": {
                          bgcolor: "#624598",
                        },
                        overflow: "hidden",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : "auto",
                          justifyContent: "center",
                        }}
                      >
                        {item.isLibraryIcon ? (
                          item.menuIcon
                        ) : (
                          <img src={item.menuIcon} alt={item.menuIconAlt} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        primary={
                          <Typography
                            variant="body2"
                            style={{ color: "#fff", fontSize: "20px" }}
                          >
                            {item?.menuTitle}
                          </Typography>
                        }
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index !== sideBarMenuOptions.length - 1 && (
                    <Divider sx={{ backgroundColor: "#fff" }} />
                  )}
                </React.Fragment>
              ))}
        </List>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
