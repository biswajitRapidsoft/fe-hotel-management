import React from "react";

import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid2 as Grid,
  styled,
  Tab,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { TabContext, TabList } from "@mui/lab";
import { useGetAllFoodQuery } from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";

const drawerWidth = 340;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme }) => ({
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: "relative",
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginRight: 0,
        },
      },
    ],
  })
);

const getFilterdMenuList = (menuList, mealType, foodType) => {
  const filterdMenuList = [];
  if (mealType === "ALL") {
    menuList.forEach((menu) => {
      if (foodType === "ALL") {
        filterdMenuList.push(...menu.veg);
        filterdMenuList.push(...menu.nonVeg);
      } else if (foodType === "VEG") {
        filterdMenuList.push(...menu.veg);
      } else if (foodType === "NON VEG") {
        filterdMenuList.push(...menu.nonVeg);
      }
    });
  } else {
  }
  return filterdMenuList;
};

const Resturant = () => {
  const [foodType, setFoodType] = React.useState("ALL");
  const [mealType, setMealType] = React.useState("ALL");
  const {
    data: menuList = {
      data: [],
    },
    isLoading,
  } = useGetAllFoodQuery(JSON.parse(sessionStorage.getItem("data")).hotelId);

  const handleTabChange = React.useCallback((e, value) => {
    setMealType(value);
  }, []);

  const handleChangeRadio = React.useCallback((e) => {
    setFoodType(e.target.value);
  }, []);

  return (
    <React.Fragment>
      <Box sx={{ display: "flex" }}>
        <Main open={true}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TabContext value={mealType}>
              <TabList onChange={handleTabChange}>
                <Tab label="All" value="ALL" />
                {menuList.data.map((menu) => {
                  return (
                    <Tab label={menu.type} value={menu.type} key={menu.type} />
                  );
                })}
              </TabList>
            </TabContext>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={foodType === "ALL"}
                    onChange={handleChangeRadio}
                    value="ALL"
                  />
                }
                label="ALL"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={foodType === "VEG"}
                    onChange={handleChangeRadio}
                    value="VEG"
                  />
                }
                label="VEG"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={foodType === "NON VEG"}
                    onChange={handleChangeRadio}
                    value="NON VEG"
                  />
                }
                label="NON VEG"
              />
            </FormGroup>
          </Box>
          <Grid container spacing={2}>
            {getFilterdMenuList(menuList.data, mealType, foodType).map(
              (foodItem) => {
                return <CustomFoodCard foodItem={foodItem} key={foodItem.id} />;
              }
            )}
          </Grid>
        </Main>
        <Drawer
          sx={{
            position: "relative",
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
          variant="persistent"
          anchor="right"
          open={true}
        >
          <DrawerHeader>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", letterSpacing: 1 }}
            >
              Place Your Order
            </Typography>
          </DrawerHeader>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}
            >
              My Order
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    component="img"
                    src="https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg"
                    alt="food item"
                    sx={{ width: 50 }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography>Cheese Burger</Typography>
                      <Typography>x1</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600 }}>$54.35</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    component="img"
                    src="https://www.foodiesfeed.com/wp-content/uploads/2023/06/burger-with-melted-cheese.jpg"
                    alt="food item"
                    sx={{ width: 50 }}
                  />
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography>Cheese Burger</Typography>
                      <Typography>x1</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 600 }}>$54.35</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Service
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                $2.00
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Total
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                $238.70
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              sx={{ color: "#fff", fontWeight: "bold" }}
            >
              Place Order
            </Button>
          </Box>
        </Drawer>
      </Box>
      <LoadingComponent open={isLoading} />
    </React.Fragment>
  );
};

const CustomFoodCard = React.memo(function ({ foodItem }) {
  return (
    <Grid
      size={{ xs: 6, md: 3, xl: 3 }}
      sx={{ boxShadow: (theme) => theme.shadows[2] }}
    >
      <Grid container>
        <Grid size={12}>
          <Box
            component="img"
            src={foodItem.image}
            alt="Food Image"
            sx={{ width: "100%", height: 200 }}
          />
        </Grid>
        <Grid size={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
            }}
          >
            <Box>
              <Typography>{foodItem.itemName}</Typography>
              <Typography sx={{ fontWeight: "bold" }}>
                Rs. {foodItem.perUnitPrice}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              sx={{ color: "white", fontWeight: 600, letterSpacing: 1 }}
            >
              Add
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
});

export default Resturant;
