// Test data for development and API testing
// Use with tools like Postman or Thunder Client

export const testUser = {
  signUp: {
    fullName: "Test User",
    email: "test@example.com",
    password: "test12345",
    role: "Customer"
  },
  signIn: {
    email: "test@example.com",
    password: "test12345"
  }
}

export const testChef = {
  signUp: {
    fullName: "Test Chef",
    email: "chef@example.com",
    password: "chef12345",
    role: "HomeCook"
  },
  kitchenSetup: {
    kitchenName: "Test Kitchen",
    bio: "A test kitchen for development",
    speciality: "South Indian",
    city: "Hyderabad"
  }
}

export const testItem = {
  name: "Test Dosa",
  description: "Crispy golden dosa with chutney",
  category: "South Indian",
  price: 80,
  foodType: "veg",
  spiceLevel: 1
}

export const testOrder = {
  deliveryAddress: "123 Test Street, Hyderabad",
  paymentMethod: "cod"
}
