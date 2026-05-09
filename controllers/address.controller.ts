import * as addressService from "../services/address.service";
import { grasp, sendResponse } from "../utility/response-utility";

export const addNewAddress = grasp(async (req, res) => {
    const address = await addressService.createAddress(
        req.params.id,
        req.validatedBody
    );

    sendResponse(res, 201, "success", "New address created successfully", address);
});


export const getAllAddressBYId = grasp(async (req, res) => {
    const addressList = await addressService.getAllAddress(
        req.params.id
    );

    sendResponse(res, 201, "success", "Get all address successfully", addressList);
})

export const updateAddressById = grasp(async (req, res) => {
    const updatedAddress = await addressService.updateAddress(
        req.params.id,
        req.validatedBody
    );

    if (!updatedAddress) {
        throw new Error("Address not found");
    }

    sendResponse(
        res,
        200,
        "success",
        "Address updated successfully",
        updatedAddress
    );
});

export const deleteAddressById = grasp(async (req, res) => {
    const deletedAddress = await addressService.deleteAddress(
        req.params.id
    );

    if (!deletedAddress) {
        throw new Error("Address not found");
    }

    sendResponse(
        res,
        200,
        "success",
        "Address deleted successfully",
        deletedAddress
    );
});

export const setDefaultAddressById = grasp(async (req, res) => {
    const address = await addressService.setDefaultAddress(
        req.params.id
    );

    sendResponse(
        res,
        200,
        "success",
        "Default address updated successfully",
        address
    );
});