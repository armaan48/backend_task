CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phoneNumber VARCHAR(15),
    email VARCHAR(255),
    linkedId UUID REFERENCES contacts(id),
    linkPrecedence VARCHAR(20) CHECK (link_precedence IN ('primary', 'secondary')),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP WITH TIME ZONE
    sz INTEGER DEFAULT 1
);