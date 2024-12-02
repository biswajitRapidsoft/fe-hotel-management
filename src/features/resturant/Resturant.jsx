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
import {
  useGetAllFoodQuery,
  useGetDineTypeQuery,
  useOrderFoodMutation,
} from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";

const drawerWidth = 399;

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
    menuList.forEach((menu) => {
      if (menu.type === mealType) {
        if (foodType === "ALL") {
          filterdMenuList.push(...menu.veg);
          filterdMenuList.push(...menu.nonVeg);
        } else if (foodType === "VEG") {
          filterdMenuList.push(...menu.veg);
        } else if (foodType === "NON VEG") {
          filterdMenuList.push(...menu.nonVeg);
        }
      }
    });
  }
  return filterdMenuList;
};

const Resturant = () => {
  const [orderFood, orderFoodRes] = useOrderFoodMutation();
  const {
    data: dineTypes = {
      data: [],
    },
  } = useGetDineTypeQuery();
  const [foodType, setFoodType] = React.useState("ALL");
  const [mealType, setMealType] = React.useState("ALL");
  const [dineType, setDineType] = React.useState("");
  const [cartItems, setCartItems] = React.useState([]);
  const [snack, setSnack] = React.useState({
    open: true,
    message: "",
    severity: "",
  });

  const {
    data: menuList = {
      data: [],
    },
    isLoading,
  } = useGetAllFoodQuery(sessionStorage.getItem("hotelId"));

  const handleTabChange = React.useCallback((e, value) => {
    setMealType(value);
  }, []);

  const handleChangeRadio = React.useCallback((e) => {
    setFoodType(e.target.value);
  }, []);

  const handleAddItemToCart = React.useCallback(
    (item) => {
      if (Boolean(cartItems.find((val) => val.id === item.id))) {
        const cartItemsToSet = [];
        cartItems.forEach((cartItem) => {
          if (item.id === cartItem.id) {
            cartItemsToSet.push({
              ...cartItem,
              quantity: cartItem.quantity + 1,
            });
          } else {
            cartItemsToSet.push(cartItem);
          }
        });
        setCartItems(cartItemsToSet);
      } else {
        setCartItems((preVal) => [...preVal, { ...item, quantity: 1 }]);
      }
    },
    [cartItems]
  );

  const calculateTotalAmountOfCartItems = React.useCallback(() => {
    return cartItems.reduce((prev, curr) => {
      return prev + curr.perUnitPrice * curr.quantity;
    }, 0);
  }, [cartItems]);

  const handleChangeRadioForDineType = React.useCallback((e) => {
    setDineType(e.target.value);
  }, []);

  const handlePlaceOrder = React.useCallback(() => {
    orderFood({
      bookingRefNo: sessionStorage.getItem("bookingRefNumber"),
      dinningType: dineType,
      itemsList: cartItems.map((item) => ({
        itemId: item.id,
        noOfItems: item.quantity,
      })),
      totalGstPrice: (calculateTotalAmountOfCartItems() * 0.18).toFixed(2),
      totalPrice: calculateTotalAmountOfCartItems(),
    })
      .unwrap()
      .then((res) => {
        setSnack({ open: true, message: res.message, severity: "success" });
        setCartItems([]);
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [cartItems, orderFood, dineType, calculateTotalAmountOfCartItems]);

  return (
    <React.Fragment>
      <Box sx={{ display: "flex" }}>
        <Main open={Boolean(cartItems.length)}>
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
                return (
                  <CustomFoodCard
                    foodItem={foodItem}
                    key={foodItem.id}
                    handleAddItemToCart={handleAddItemToCart}
                  />
                );
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
            pointerEvents: Boolean(cartItems.length) ? "auto" : "none",
          }}
          variant="persistent"
          anchor="right"
          open={Boolean(cartItems.length)}
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
            <Divider />
            <Box
              sx={{
                height: 350,
                overflowY: "auto",
                // backgroundColor: "#f7f0ff",
                p: 0.75,
              }}
            >
              <Grid container spacing={2}>
                {cartItems.map((cartItem) => {
                  return (
                    <Grid size={12} key={cartItem.id}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Box
                          component="img"
                          src={cartItem.image}
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
                            <Typography>{cartItem.itemName}</Typography>
                            <Typography>{`x${cartItem.quantity}`}</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>{`Rs. ${
                            cartItem.perUnitPrice * cartItem.quantity
                          }`}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: 20,
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                GST (18%)
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${(calculateTotalAmountOfCartItems() * 0.18).toFixed(2)}`}
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
                {`Rs. ${(
                  calculateTotalAmountOfCartItems() +
                  calculateTotalAmountOfCartItems() * 0.18
                ).toFixed(2)}`}
              </Typography>
            </Box>
            <FormGroup row>
              {dineTypes.data.map((option) => {
                return (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={dineType === option}
                        onChange={handleChangeRadioForDineType}
                        size="small"
                        value={option}
                      />
                    }
                    label={option.replace("_", " ")}
                  />
                );
              })}
            </FormGroup>
            <Button
              color="secondary"
              variant="contained"
              sx={{
                color: "#fff",
                fontWeight: 600,
                textTransform: "none",
                fontSize: 18,
                "&.Mui-disabled": {
                  background: "#B2E5F6",
                  color: "#FFFFFF",
                },
              }}
              type="submit"
              disabled={!Boolean(cartItems.length && dineType)}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Box>
        </Drawer>
      </Box>
      <LoadingComponent open={isLoading || orderFoodRes.isLoading} />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const CustomFoodCard = React.memo(function ({ foodItem, handleAddItemToCart }) {
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
              onClick={() => handleAddItemToCart(foodItem)}
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
