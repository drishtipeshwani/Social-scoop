// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Socialscoop{
  string public name = "Socialscoop";

  //Store photos
  uint public imageCount = 0;
  mapping(uint => Image) public images;

  //Defining an Image structure

  struct Image{
      uint id;
      string hash;
      string description;
      uint tipamount;
      address payable author;
  }

  event ImageCreated(
       uint id,
      string hash,
      string description,
      uint tipamount,
      address payable author
  );

  //Define an event to inform that image has been tipped

  event ImageTipped(
    uint id,
    string hash,
    string description,
    uint tipamount,
    address payable author
  );

  //Create photos

  //Defining an upload image function

  function uploadImage(string memory _imgHash,string memory _description) public{

    // Make sure the image hash exists
    require(bytes(_imgHash).length > 0);

    // Make sure image description exists
    require(bytes(_description).length > 0);

    // Make sure uploader address exists and is not equal to a blank address
    require(msg.sender!=address(0));

    imageCount++;
    images[imageCount] = Image(imageCount,_imgHash,_description,0,msg.sender);
    
    //Triggering the event
    emit ImageCreated(imageCount,_imgHash,_description,0,msg.sender);
  }

  //Tip photos

  function tipImageOwner(uint _id) public payable{
      
       // Make sure the id is valid
       require(_id > 0 && _id <= imageCount);

      //First we will fetch the image
      Image memory _image = images[_id];
      //Fetch the author to pay them
      address payable _author = _image.author;
      address(_author).transfer(msg.value);

      // Increment the tip amount
    _image.tipamount = _image.tipamount + msg.value;

    // Update the image as value of tip amount was changed
    images[_id] = _image;

    // Trigger an event
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipamount, _author);

  }
}
