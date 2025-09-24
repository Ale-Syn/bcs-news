export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  title: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  isFeaturedSide?: boolean;
};

export type IUpdatePost = {
  postId: string;
  title: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
  isFeaturedSide?: boolean;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  role?: "ADMIN" | "USER" | "EDITOR";
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};
