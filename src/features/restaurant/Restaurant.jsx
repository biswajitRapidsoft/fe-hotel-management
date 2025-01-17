import React, { memo } from "react";

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
  IconButton,
  Dialog,
  DialogTitle,
  Slide,
  Rating,
  DialogContent,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import { MdOutlineRoomService } from "react-icons/md";

import { TabContext, TabList } from "@mui/lab";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import {
  useGetAllFoodQuery,
  useGetCustomerOrdeHistoryQuery,
  useGetDineTypeQuery,
  useOrderFoodMutation,
} from "../../services/restaurant";
import LoadingComponent from "../../components/LoadingComponent";
import SnackAlert from "../../components/Alert";
import OrderHistoryDrawer from "./OrderHistoryDrawer";
import { useGetAllRestaurantPromocodeByHotelIdQuery } from "../../services/dashboard";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import { RiDiscountPercentLine } from "react-icons/ri";
import { RiDiscountPercentFill } from "react-icons/ri";
import CloseIcon from "@mui/icons-material/Close";
import { FaArrowAltCircleLeft } from "react-icons/fa";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const drawerWidth = 399;

export const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const CustomCouponCard = React.memo(function ({
  couponData,
  handleCheckboxClick,
  isAnyCheckboxSelected,
  isThisCheckboxSelected,
  calculateTotalAmountOfCartItems,
  calculateDiscountOnOrder,
}) {
  const calculateTotalAmountOfCartItemsResult = React.useMemo(
    () => calculateTotalAmountOfCartItems(),
    [calculateTotalAmountOfCartItems]
  );
  console.log(
    "calculateTotalAmountOfCartItemsResult : ",
    calculateTotalAmountOfCartItemsResult
  );
  const calculateDiscountOnOrderResult = React.useMemo(() => {
    return calculateDiscountOnOrder({
      cartPrice: calculateTotalAmountOfCartItemsResult,
      coupon: couponData,
    });
  }, [
    calculateDiscountOnOrder,
    calculateTotalAmountOfCartItemsResult,
    couponData,
  ]);
  const handleCheckBoxClickOnChange = React.useCallback(
    (couponValue) => {
      handleCheckboxClick(couponValue);
    },
    [handleCheckboxClick]
  );

  console.log(
    "calculateDiscountOnOrderResult : ",
    calculateDiscountOnOrderResult
  );

  return (
    <Grid size={12} key={couponData?.id}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          borderRadius: "5px",
          cursor:
            isAnyCheckboxSelected && !isThisCheckboxSelected
              ? "default"
              : "pointer",
          px: 2,
          py: 1,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (
            Boolean(
              calculateDiscountOnOrderResult?.isApplicable &&
                !isAnyCheckboxSelected
            )
          ) {
            handleCheckBoxClickOnChange(couponData);
          } else if (
            calculateDiscountOnOrderResult?.isApplicable &&
            Boolean(isAnyCheckboxSelected && isThisCheckboxSelected)
          ) {
            handleCheckBoxClickOnChange(couponData);
          }
        }}
      >
        <Box sx={{ width: "90%" }}>
          <Typography sx={{ fontSize: "12.5px", fontWeight: 550 }}>{`Flat ${
            couponData?.discountPercentage
          }% off upto Rs. ${couponData?.maxDiscountAmount?.toFixed(
            2
          )} on minimum order of Rs. ${couponData?.minOrderValue?.toFixed(
            2
          )}.`}</Typography>
          <Typography sx={{ mt: "5px" }}>
            <Typography
              component="span"
              sx={{
                fontSize: "11.5px",
                fontWeight: 550,
                color: "#737373",
              }}
            >
              Coupon code
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "11.5px",
                fontWeight: 550,
                color: "#737373",
              }}
            >
              {" "}
              :{" "}
            </Typography>
            <Typography
              component="span"
              sx={{
                border: "1px dashed #9c9c9c",
                paddingX: "8px",
                paddingY: "3px",
                borderRadius: "4px",
                fontSize: "12.5px",
                fontWeight: 550,
                color: "#0e36b3",
              }}
            >
              {couponData?.codeName}
            </Typography>
          </Typography>

          {calculateDiscountOnOrderResult?.isApplicable ? (
            <Typography
              sx={{
                fontSize: "10.5px",
                fontWeight: 550,
                color: "#0000ff",
                mt: 0.5,
              }}
            >
              {`You will save Rs. ${calculateDiscountOnOrderResult?.discountPrice?.toFixed(
                2
              )} on this order.`}
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: "10px",
                fontWeight: 550,
                color: "#ff0000",
                mt: 0.5,
              }}
            >
              Coupon is not applicable!
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Checkbox
            defaultChecked={false}
            disabled={isAnyCheckboxSelected && !isThisCheckboxSelected}
            checked={isThisCheckboxSelected}
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<RadioButtonCheckedIcon />}
          />
        </Box>
      </Box>
    </Grid>
  );
});

export const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
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
}));

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

const Restaurant = () => {
  const [isOrderHistoryDrawer, setIsOrderHistoryDrawer] = React.useState(false);
  const [selectedRestaurantCoupon, setSelectedRestaurantCoupon] =
    React.useState(null);
  console.log("selectedRestaurantCoupon : ", selectedRestaurantCoupon);
  const [isViewAllCouponsSelected, setIsViewAllCouponsSelected] =
    React.useState(false);

  console.log("isViewAllCouponsSelected : ", isViewAllCouponsSelected);
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
  // const [cartOpen, setCartOpen] = React.useState(true);
  const [snack, setSnack] = React.useState({
    open: false,
    message: "",
    severity: "",
  });

  const {
    data: menuList = {
      data: [],
    },
    isLoading,
  } = useGetAllFoodQuery(sessionStorage.getItem("hotelId"));
  const {
    data: orderHistory = {
      data: [],
    },
  } = useGetCustomerOrdeHistoryQuery(
    sessionStorage.getItem("bookingRefNumber")
  );

  const {
    data: allRestaurantPromocodeByHotelIdData = {
      data: [],
    },
    isLoading: isAllRestaurantPromocodeByHotelIdDataLoading,
  } = useGetAllRestaurantPromocodeByHotelIdQuery(
    { hotelId: JSON.parse(sessionStorage.getItem("hotelId")) },
    {
      refetchOnMountOrArgChange: true,
      skip: !Boolean(JSON.parse(sessionStorage.getItem("hotelId"))),
    }
  );

  console.log(
    "allRestaurantPromocodeByHotelIdData : ",
    allRestaurantPromocodeByHotelIdData
  );

  const handleTabChange = React.useCallback((e, value) => {
    setMealType(value);
  }, []);

  const handleChangeRadio = React.useCallback((e) => {
    setFoodType(e.target.value);
  }, []);

  const handleCloseCart = React.useCallback(() => {
    // setCartOpen(false);
    setCartItems([]);
  }, []);

  const handleAddItemToCart = React.useCallback(
    (item) => {
      // setCartOpen(true);
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

  const handleRemoveItemFromCart = React.useCallback(
    (item) => {
      if (item.quantity === 1) {
        const cartItemsToSet = cartItems.filter(
          (cartItem) => cartItem.id !== item.id
        );
        setCartItems(cartItemsToSet);
      } else {
        const cartItemsToSet = cartItems.map((cartItem) => {
          if (cartItem.id === item.id) {
            return {
              ...cartItem,
              quantity: cartItem.quantity - 1,
            };
          }
          return cartItem;
        });
        setCartItems(cartItemsToSet);
      }
    },
    [cartItems]
  );

  const calculateTotalAmountOfCartItems = React.useCallback(() => {
    return cartItems?.reduce((prev, curr) => {
      return prev + curr.perUnitPrice * curr.quantity;
    }, 0);
  }, [cartItems]);

  const handleChangeRadioForDineType = React.useCallback((e) => {
    setDineType(e.target.value);
  }, []);

  // const calculateDiscountOnOrder = React.useCallback((cartPrice, coupon) => {
  //   // Initialize default response
  //   let discountedPrice = cartPrice + cartPrice * 0.18;
  //   let discountPrice = 0;
  //   let isApplicable = false;

  //   // Check for null or invalid values
  //   if (!cartPrice || cartPrice <= 0 || !coupon) {
  //     return { discountedPrice, discountPrice, isApplicable };
  //   }

  //   // Ensure coupon has valid properties
  //   const { discountPercentage, maxDiscountAmount, minOrderValue } = coupon;

  //   if (!discountPercentage || !maxDiscountAmount || !minOrderValue) {
  //     return { discountedPrice, discountPrice, isApplicable };
  //   }

  //   // Validate if the cart price qualifies for the coupon
  //   if (cartPrice >= minOrderValue) {
  //     // Calculate potential discount
  //     discountPrice = (cartPrice * discountPercentage) / 100;

  //     // Cap the discount price at the maximum discount amount
  //     discountPrice = Math.min(discountPrice, maxDiscountAmount);

  //     // Calculate the final discounted price
  //     discountedPrice = cartPrice - discountPrice;

  //     // Mark the coupon as applicable
  //     isApplicable = true;
  //   }

  //   // Return the result
  //   return { discountedPrice, discountPrice, isApplicable };
  // }, []);

  const calculateDiscountOnOrder = React.useCallback(
    ({ cartPrice, gst = 0.18, coupon }) => {
      // Initialize default response
      let discountedPrice = 0;
      let discountPrice = 0;
      let gstPrice = 0;
      let isApplicable = false;

      // Validate inputs
      if (!cartPrice || cartPrice <= 0) {
        return { discountedPrice, discountPrice, gstPrice, isApplicable };
      }

      // Calculate GST
      gstPrice = cartPrice * gst;

      // Add GST to cart price
      const cartPriceWithGST = cartPrice + gstPrice;

      // If no coupon is provided, return the GST-included price
      if (!coupon) {
        return {
          discountedPrice: cartPriceWithGST,
          discountPrice,
          gstPrice,
          isApplicable,
        };
      }

      // Destructure coupon properties
      const {
        discountPercentage = 0,
        maxDiscountAmount = 0,
        minOrderValue = 0,
      } = coupon;

      // Validate coupon properties
      if (
        cartPriceWithGST >= minOrderValue &&
        discountPercentage > 0 &&
        maxDiscountAmount > 0
      ) {
        discountPrice = (cartPriceWithGST * discountPercentage) / 100; // Calculate discount
        discountPrice = Math.min(discountPrice, maxDiscountAmount); // Cap discount
        discountedPrice = cartPriceWithGST - discountPrice; // Subtract discount
        isApplicable = true;
      } else {
        discountedPrice = cartPriceWithGST; // No discount, only GST applied
      }

      // Return all values
      return { discountedPrice, discountPrice, gstPrice, isApplicable };
    },
    []
  );

  const handlePlaceOrder = React.useCallback(() => {
    orderFood({
      bookingRefNo: sessionStorage.getItem("bookingRefNumber"),
      hotelId: sessionStorage.getItem("hotelId"),
      dinningType: dineType,
      itemsList: cartItems.map((item) => ({
        itemId: item.id,
        noOfItems: item.quantity,
      })),
      totalGstPrice: (calculateTotalAmountOfCartItems() * 0.18).toFixed(2),
      totalPrice: calculateTotalAmountOfCartItems(),

      ...(Boolean(selectedRestaurantCoupon?.id) && {
        discountPrice: parseFloat(
          calculateDiscountOnOrder({
            cartPrice: calculateTotalAmountOfCartItems(),
            coupon: selectedRestaurantCoupon,
          })?.discountPrice.toFixed(2)
        ),
        promocode: {
          id: selectedRestaurantCoupon?.id,
        },
      }),
    })
      .unwrap()
      .then((res) => {
        setSnack({ open: true, message: res.message, severity: "success" });
        setCartItems([]);
        setSelectedRestaurantCoupon(null);
      })
      .catch((err) => {
        setSnack({
          open: true,
          message: err.data?.message || err.data,
          severity: "error",
        });
      });
  }, [
    cartItems,
    orderFood,
    dineType,
    calculateTotalAmountOfCartItems,
    calculateDiscountOnOrder,
    selectedRestaurantCoupon,
  ]);

  const handleChangeIsViewAllCouponsSelected = React.useCallback(() => {
    setIsViewAllCouponsSelected((prev) => !prev);
  }, []);

  const handleChangeSelectedRestaurantCoupon = React.useCallback(
    (checkboxValue) => {
      console.log(
        "handleChangeSelectedRestaurantCoupon checkboxValue: ",
        checkboxValue
      );
      if (selectedRestaurantCoupon?.id !== checkboxValue?.id) {
        if (checkboxValue?.id) {
          console.log(
            "handleChangeSelectedRestaurantCoupon handleChangeIsViewAllCouponsSelected"
          );
          handleChangeIsViewAllCouponsSelected();
        }
        setSelectedRestaurantCoupon(checkboxValue || null);
      } else {
        setSelectedRestaurantCoupon(null);
      }
    },
    [handleChangeIsViewAllCouponsSelected, selectedRestaurantCoupon]
  );

  return (
    <React.Fragment>
      <Box sx={{ display: "flex" }}>
        <Main open={Boolean(cartItems?.length)}>
          <Button
            variant="contained"
            size="small"
            color="secondary"
            sx={{
              color: "white",
              fontWeight: 600,
              letterSpacing: 1,
              display: "block",
              ml: "auto",
            }}
            onClick={() => setIsOrderHistoryDrawer(true)}
          >
            Order History
          </Button>
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
            pointerEvents: Boolean(cartItems?.length) ? "auto" : "none",
          }}
          variant="persistent"
          anchor="right"
          open={Boolean(cartItems?.length)}
        >
          <DrawerHeader>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Place Your Order
              </Typography>
              <IconButton sx={{ padding: 0.3 }} onClick={handleCloseCart}>
                <CloseIcon sx={{ fontSize: "19px" }} />
              </IconButton>
            </Box>
          </DrawerHeader>
          <Divider />
          {isViewAllCouponsSelected ? (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 0.45 }}>
                <FaArrowAltCircleLeft
                  style={{
                    color: "#164e80",
                    cursor: "pointer",
                    marginTop: "6px",
                    fontSize: "20px",
                  }}
                  onClick={() => handleChangeIsViewAllCouponsSelected()}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}
                >
                  Coupons
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  height: 320,
                  overflowY: "auto",
                  // backgroundColor: "#f7f0ff",
                  p: 0.75,
                }}
              >
                <Grid container spacing={2}>
                  {allRestaurantPromocodeByHotelIdData?.data?.map(
                    (promoItem) => (
                      <CustomCouponCard
                        couponData={promoItem}
                        calculateTotalAmountOfCartItems={
                          calculateTotalAmountOfCartItems
                        }
                        calculateDiscountOnOrder={calculateDiscountOnOrder}
                        isAnyCheckboxSelected={
                          Boolean(selectedRestaurantCoupon?.id) ? true : false
                        }
                        isThisCheckboxSelected={
                          Boolean(
                            selectedRestaurantCoupon?.id === promoItem?.id
                          )
                            ? true
                            : false
                        }
                        handleCheckboxClick={
                          handleChangeSelectedRestaurantCoupon
                        }
                      />
                    )
                  )}

                  {/* {Array.from({ length: 5 }, (_, i) => ({
                    id: i + 1,
                    discountPercentage: 20 + i * 10,
                    maxDiscountAmount: 200 + i * 100,
                    minOrderValue: 1200 + i * 1000,
                    codeName: `CODE-${100 + i}`,
                  }))?.map((promoItem) => (
                    <CustomCouponCard
                      couponData={promoItem}
                      calculateTotalAmountOfCartItems={
                        calculateTotalAmountOfCartItems
                      }
                      calculateDiscountOnOrder={calculateDiscountOnOrder}
                      isAnyCheckboxSelected={
                        Boolean(selectedRestaurantCoupon?.id) ? true : false
                      }
                      isThisCheckboxSelected={
                        Boolean(selectedRestaurantCoupon?.id === promoItem?.id)
                          ? true
                          : false
                      }
                      handleCheckboxClick={handleChangeSelectedRestaurantCoupon}
                    />
                  ))} */}
                </Grid>
              </Box>

              <Divider sx={{ mt: 1 }} />
            </Box>
          ) : (
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
                  height: 300,
                  overflowY: "auto",
                  // backgroundColor: "#f7f0ff",
                  p: 0.75,
                }}
              >
                <Grid container spacing={2}>
                  {cartItems?.map((cartItem) => {
                    return (
                      <Grid size={12} key={cartItem.id}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Box
                            component="img"
                            // src={cartItem.image}
                            src={cartItem.imageList[0]}
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
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleRemoveItemFromCart(cartItem)
                                  }
                                >
                                  <RemoveIcon fontSize="small" color="error" />
                                </IconButton>
                                <Typography>{`x ${cartItem.quantity}`}</Typography>
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleAddItemToCart(cartItem)}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
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
              <Divider sx={{ mt: 1 }} />
              {Boolean(allRestaurantPromocodeByHotelIdData?.data?.length) && (
                <>
                  {Boolean(selectedRestaurantCoupon?.id) ? (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.8,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 1,
                        backgroundColor: "#ffffff",
                        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                        transition: "all 0.3s ease",

                        "&:hover": {
                          backgroundColor: "#f3f3f3",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <RiDiscountPercentFill />
                        <Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "13px" }}
                          >
                            Coupon applied!{"  "}
                          </Typography>
                          <Typography
                            component="span"
                            sx={{ fontSize: "13px", fontWeight: 550 }}
                          >{`${selectedRestaurantCoupon?.codeName} ${selectedRestaurantCoupon?.discountPercentage}% off`}</Typography>
                        </Typography>
                      </Box>

                      <IconButton
                        sx={{ padding: 0.3 }}
                        onClick={() => handleChangeSelectedRestaurantCoupon()}
                      >
                        <CloseIcon sx={{ fontSize: "19px" }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.8,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 1,
                        backgroundColor: "#ffffff",
                        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#f3f3f3",
                        },
                      }}
                      onClick={() => handleChangeIsViewAllCouponsSelected()}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <RiDiscountPercentLine />
                        <Typography sx={{ fontSize: "14px", fontWeight: 550 }}>
                          View All Coupons
                        </Typography>
                      </Box>

                      <KeyboardArrowRightIcon />
                    </Box>
                  )}
                  <Divider sx={{ mt: 1 }} />
                </>
              )}
            </Box>
          )}

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
                Total
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${calculateTotalAmountOfCartItems()?.toFixed(2)}`}
              </Typography>
            </Box>

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
            {selectedRestaurantCoupon?.id && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", letterSpacing: 1 }}
                >
                  Discount
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", letterSpacing: 1 }}
                >
                  {`Rs. ${calculateDiscountOnOrder({
                    cartPrice: calculateTotalAmountOfCartItems(),
                    coupon: selectedRestaurantCoupon,
                  })?.discountPrice.toFixed(2)}`}
                </Typography>
              </Box>
            )}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                Total <span style={{ fontSize: "10px" }}>(Including GST)</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                {`Rs. ${calculateDiscountOnOrder({
                  cartPrice: calculateTotalAmountOfCartItems(),
                  coupon: selectedRestaurantCoupon,
                })?.discountedPrice.toFixed(2)}`}
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
              disabled={!Boolean(cartItems?.length && dineType)}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </Box>
        </Drawer>
        <OrderHistoryDrawer
          open={isOrderHistoryDrawer}
          handleClose={() => setIsOrderHistoryDrawer(false)}
          orderHistory={orderHistory.data}
        />
      </Box>
      <LoadingComponent
        open={
          isLoading ||
          orderFoodRes.isLoading ||
          isAllRestaurantPromocodeByHotelIdDataLoading
        }
      />
      <SnackAlert snack={snack} setSnack={setSnack} />
    </React.Fragment>
  );
};

const CustomFoodCard = React.memo(function ({ foodItem, handleAddItemToCart }) {
  console.log("foodItem", foodItem.image);
  const [openFoodDetailsDialog, setOpenFoodDetailsDialog] =
    React.useState(false);

  const [foodDetailsData, setFoodDetailsData] = React.useState(null);

  const handleFoodDetails = (item) => {
    setOpenFoodDetailsDialog(true);
    setFoodDetailsData(item);
  };
  const handleFoodDetailsDialogClose = () => {
    setOpenFoodDetailsDialog(false);
    setFoodDetailsData(null);
  };

  return (
    <>
      <Grid
        size={{ xs: 6, md: 3, xl: 2.4 }}
        sx={{
          // boxShadow: (theme) => theme.shadows[2],
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          borderRadius: "10px",
          backgroundColor: "#fff",
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "77px",
            height: "24px",
            clipPath: `polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0% 100%)`,
            bgcolor: "lavender",
            position: "absolute",
            background: "#ffffff78",
            backdropFilter: "blur(35px)",
            WebkitBackdropFilter: "blur(35px)",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              // justifyContent: "space-evenly",
            }}
          >
            <Box
              sx={{
                boxSizing: "border-box",
                width: "18px",
                height: "18px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                // border: "1.3px solid #ff0000",
                border: Boolean(foodItem?.foodtype === "Non_Veg")
                  ? "1.3px solid #ff0000"
                  : "1.3px solid green",
                ml: 1.5,
              }}
            >
              <Box
                sx={{
                  minWidth: "13px",
                  minHeight: "13px",
                  borderRadius: "50%",
                  // bgcolor: "#ff0000",
                  bgcolor: Boolean(foodItem?.foodtype === "Non_Veg")
                    ? "#ff0000"
                    : "green",
                }}
              ></Box>
            </Box>
          </Box>
        </Box>
        <Grid container sx={{ borderRadius: "10px" }}>
          <Grid size={12}>
            <Box
              component="img"
              src={foodItem?.imageList[0] || ""}
              alt="Food Image"
              sx={{
                width: "100%",
                height: 200,
                borderRadius: "10px",
                cursor: "pointer",
              }}
              onClick={() => handleFoodDetails(foodItem)}
            />
          </Grid>
          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                // alignItems: "center",
                justifyContent: "space-between",
                p: 1,
                backgroundColor: "#fff",
                // backgroundColor: "red",
                borderRadius: "10px",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  px: 1,
                  // flexDirection: "column",
                  gap: 0.6,
                  mb: 0.3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    // , gap: 0.3
                  }}
                >
                  {/* <Grid container size={12} spacing={1}> */}
                  {/* <Grid size={{ xs: 6 }}> */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      // backgroundColor: "#F0F0F5",
                      // borderRadius: "10px",
                      px: 1,
                      // width: "60%",
                      height: "1.4rem",
                    }}
                  >
                    <LunchDiningIcon
                      sx={{ color: "gray", fontSize: "0.8rem" }}
                    />

                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color: "gray",
                      }}
                    >
                      Dine-In
                    </Typography>
                  </Box>
                  {/* </Grid> */}
                  {/* <Grid size={{ xs: 6 }}> */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      // backgroundColor: "#F0F0F5",
                      // borderRadius: "10px",
                      px: 1,
                      // width: "60%",
                      height: "1.4rem",
                    }}
                  >
                    {/* <Box
                  sx={{
                    height: "5px",
                    width: "5px",
                    borderRadius: "50%",
                    backgroundColor: "gray",
                  }}
                ></Box> */}
                    <EventAvailableIcon
                      sx={{ color: "gray", fontSize: "0.8rem" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color: "gray",
                      }}
                    >
                      Take-away
                    </Typography>
                  </Box>
                  {/* </Grid> */}
                  {/* <Grid size={{ xs: 6 }}> */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      // backgroundColor: "#F0F0F5",
                      // borderRadius: "10px",
                      px: 1,
                      height: "1.4rem",

                      // width: "60%",
                    }}
                  >
                    {/* <Box
                  sx={{
                    height: "5px",
                    width: "5px",
                    borderRadius: "50%",
                    backgroundColor: "gray",
                  }}
                ></Box> */}
                    <MdOutlineRoomService
                      style={{ color: "gray", fontSize: "0.8rem" }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        color: "gray",
                      }}
                    >
                      Room Delivery
                    </Typography>
                  </Box>
                </Box>
                {/* {foodItem.ratingPoints && ( */}
                {!Boolean(foodItem.ratingPoints === 0) && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: "7px",
                        display: "flex",
                        gap: 0.7,
                        // backgroundColor: "green",
                        backgroundColor:
                          foodItem.ratingPoints < 3 ? "red" : "green",

                        px: 0.8,
                        // p: 0.4,
                        // py: 0.2,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                        }}
                      >
                        {/* {foodItem.ratingPoints
                      ? foodItem.ratingPoints.toFixed(1)
                      : 1} */}
                        {typeof foodItem?.ratingPoints === "number"
                          ? foodItem.ratingPoints.toFixed(1)
                          : "1.0"}
                      </Typography>
                      <StarIcon sx={{ color: "#fff", fontSize: "0.9rem" }} />
                    </Box>
                    {/* <Rating value={4} readOnly /> */}
                  </Box>
                )}

                {/* // )} */}
                {/* </Grid> */}
                {/* </Grid> */}
              </Box>
              <Box
                sx={{
                  backgroundColor: "#E5F5FF",
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderRadius: "15px",
                }}
              >
                <Box>
                  <Typography>{foodItem.itemName}</Typography>
                  <Typography sx={{ color: "gray" }}>
                    {foodItem?.descriptions}
                  </Typography>
                  <Typography sx={{ fontWeight: "bold" }}>
                    Rs. {foodItem.perUnitPrice}
                  </Typography>
                </Box>
                <Box>
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
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      <FoodDetailsDialog
        open={openFoodDetailsDialog}
        foodDetailsData={foodDetailsData}
        handleFoodDetailsDialogClose={handleFoodDetailsDialogClose}
      />
    </>
  );
});

const FoodDetailsDialog = memo(function ({
  open,
  foodDetailsData,
  handleFoodDetailsDialogClose,
}) {
  console.log("foodDetailsData", foodDetailsData);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? foodDetailsData?.imageList?.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === foodDetailsData?.imageList?.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  console.log("length", foodDetailsData?.imageList?.length);
  return (
    <Dialog
      TransitionComponent={Transition}
      open={open}
      onClose={handleFoodDetailsDialogClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 24 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontSize: "1.7rem",
              fontFamily: "'Times New Roman', Times, serif",
              fontWeight: "bold",
              // color: "#606470",
              color: "#0f0f0f",
            }}
          >
            {foodDetailsData?.itemName}
          </Typography>

          <Rating
            value={foodDetailsData?.ratingPoints}
            disabled
            sx={{ color: "#0f0f0f", fontSize: "1.1rem" }}
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {foodDetailsData?.imageList?.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                fontSize: "1.5rem",
                color: "#555",
              }}
            >
              No images found
            </Box>
          ) : (
            <Box
              sx={{
                height: "400px",
                overflow: "hidden",
                borderRadius: "8px",
                position: "relative",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: "transform 0.5s ease-in-out",
                  height: "100%",
                }}
              >
                {foodDetailsData?.imageList?.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: "0 0 100%",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      src={image}
                      alt={`Image ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
              {/* Navigation buttons */}

              {foodDetailsData?.imageList?.length > 1 && (
                <>
                  <IconButton
                    onClick={goToPrevious}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "16px",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      zIndex: 1,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>

                  <IconButton
                    onClick={goToNext}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: "16px",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      zIndex: 1,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </>
              )}
              {/* Dots navigation */}

              <Box
                sx={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: "8px",
                }}
              >
                {foodDetailsData?.imageList?.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToSlide(index)}
                    sx={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor:
                        index === currentIndex
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default Restaurant;
