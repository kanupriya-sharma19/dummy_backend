import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function display(req, res) {
  try {
    const allUsers = await prisma.user.findMany();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
}

async function postUser(req, res) {
  try {
    const { name } = req.body;
    const user = await prisma.user.create({
      data: { name }
    });
    res.status(200).send({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).send({ message: 'Error creating user', error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    res.status(200).send({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    res.status(500).send({ message: 'Error updating user', details: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: 'User deleted successfully',
      user,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user', details: err.message });
  }
}

export { display, postUser, updateUser, deleteUser };
