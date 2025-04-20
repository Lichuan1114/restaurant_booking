"use client";

import { FormEvent } from "react";

export default function RestaurantSignup () {

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    return (
        <>
        <h1 className="text-3xl text-center">New Restaurant Sign Up</h1>
        <form onSubmit={onSubmit}>
            <label htmlFor="res_name">Restaurant Name:</label><br/>
            <input type="text" id="res_name" name="res_name" required/><br/>

        </form>
        </>
    );
}